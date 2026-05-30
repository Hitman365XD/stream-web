import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./VideoPlayer.css";

function VideoPlayer({ title }) {
  const videoRef = useRef(null);
  const hideTimer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    // const streamUrl = "http://localhost/hls/test.m3u8";
    const streamUrl = "https://tions-surround-james-house.trycloudflare.com/hls/test.m3u8";

    const resetHideTimer = () => {
      setShowControls(true);
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    };

    resetHideTimer();

    return () => {
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  const resetHideTimer = () => {
    setShowControls(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2500);
  };

  useEffect(() => {
    // Proviene del servicio para vídeo
    const video = videoRef.current;
    // const streamUrl = "http://localhost/hls/test.m3u8";
    const streamUrl = "https://tions-surround-james-house.trycloudflare.com/hls/test.m3u8";

    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 0,
        maxFragLookUpTolerance: 0.2,
        enableWorker: true,
        capLevelToPlayerSize: true,
        autoStartLoad: true,
        fragLoadingTimeOut: 15000,
        manifestLoadingTimeOut: 10000,
        levelLoadingTimeOut: 10000,
        nudgeOffset: 0.1,
      });

      // Watchdog para monitorear memoria en transmisiones largas (3-4h)
      let watchdogInterval = null;
      const startMemoryWatchdog = () => {
        watchdogInterval = setInterval(() => {
          if (performance.memory) {
            const usedMemory = performance.memory.usedJSHeapSize / 1048576; // MB
            const memoryLimit = 500; // 500 MB threshold
            
            if (usedMemory > memoryLimit) {
              console.warn(`⚠️ Memoria alta: ${usedMemory.toFixed(2)}MB. Reiniciando HLS...`);
              hls.stopLoad();
              hls.destroy();
              
              // Reiniciar HLS
              setTimeout(() => {
                if (video) {
                  const newHls = new Hls({
                    lowLatencyMode: true,
                    liveSyncDurationCount: 3,
                    liveMaxLatencyDurationCount: 5,
                    maxBufferLength: 30,
                    maxMaxBufferLength: 60,
                    backBufferLength: 0,
                    maxFragLookUpTolerance: 0.2,
                    enableWorker: true,
                    capLevelToPlayerSize: true,
                    autoStartLoad: true,
                    fragLoadingTimeOut: 15000,
                    manifestLoadingTimeOut: 10000,
                    levelLoadingTimeOut: 10000,
                    nudgeOffset: 0.1,
                  });
                  newHls.loadSource(streamUrl);
                  newHls.attachMedia(video);
                }
              }, 1000);
            }
          }
        }, 60000); // Revisar cada minuto
      };
      
      startMemoryWatchdog();
      // Probe del manifest antes de cargar para detectar 404/CORS y evitar errores fatales
      const probeManifest = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          const resp = await fetch(streamUrl, { method: "HEAD", mode: "cors", signal: controller.signal });
          clearTimeout(timeoutId);

          if (!resp.ok) {
            console.warn("Manifest probe status:", resp.status);
            setStatusMessage(`Manifest no disponible (HTTP ${resp.status}).`);
            scheduleRetry(3000);
            return false;
          }

          const ct = resp.headers.get("content-type") || "";
          if (!ct.includes("mpegurl") && !ct.includes("application/vnd.apple.mpegurl") && !ct.includes("vnd.apple.mpegurl")) {
            console.warn("Content-Type inesperado en manifest:", ct);
          }

          setStatusMessage(null);
          return true;
        } catch (err) {
          console.warn("Error probing manifest:", err);
          setStatusMessage("No se pudo acceder al manifest.");
          scheduleRetry(3000);
          return false;
        }
      };
      probeManifest().then((ok) => {
        if (ok) {
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          console.warn("Skipping hls.loadSource because manifest probe failed.");
        }
      });

      // Sistema de reintentos con backoff exponencial
      let retryCount = 0;
      const MAX_RETRIES = 5;
      let retryTimeout = null;

      const handleManifestParsed = () => {
        console.log("✅ Manifest cargado. Esperando video...");
        retryCount = 0; // Reset contador si se carga correctamente
        video.play().catch((e) => console.log("Error al reproducir: ", e));
      };

      const scheduleRetry = (delay = 2000) => {
        if (retryCount >= MAX_RETRIES) {
          console.error("❌ Max reintentos alcanzados. Revisa si el stream está activo.");
          return;
        }

        retryCount++;
        const backoffDelay = Math.min(delay * Math.pow(2, retryCount - 1), 30000); // Cap a 30s

        console.warn(`⏳ Reintentando en ${backoffDelay / 1000}s (intento ${retryCount}/${MAX_RETRIES})...`);

        retryTimeout = setTimeout(() => {
          hls.startLoad();
        }, backoffDelay);
      };

      const handleError = (event, data) => {
        console.error(`🔴 Error HLS [${data.type}]:`, data.details, "Fatal:", data.fatal);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Podría ser: sin conexión, manifest no existe, o transmisión en pausa
              if (data.details === "manifestLoadError" || data.details === "manifestParsingError") {
                console.warn("⚠️ Manifest no disponible. ¿Transmisión en pausa?");
                scheduleRetry(3000); // Reintentar cada 3s
              } else {
                console.warn("⚠️ Error de red. Reintentar...");
                scheduleRetry(5000); // Esperar 5s antes de reintentar
              }
              break;

            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("⚠️ Error de media. Recuperando...");
              hls.recoverMediaError();
              scheduleRetry(2000); // Si sigue fallando, reintentar
              break;

            default:
              console.error("❌ Error fatal desconocido. Parando...");
              hls.stopLoad();
              break;
          }
        }
      };

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, handleManifestParsed);
      hls.on(Hls.Events.ERROR, handleError);
      hls.on(Hls.Events.BUFFER_APPENDING, () => {
        const video = videoRef.current;
        if (!video) return;
        const buffered = video.buffered;

        if (buffered.length > 0) {
          const liveEdge = buffered.end(buffered.length - 1);

          if (liveEdge - video.currentTime > 4) {
            video.currentTime = liveEdge - 1;
          }
        }
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        const video = videoRef.current;
        if (!video) return;
        const buffered = video.buffered;

        if (buffered.length > 0) {
          const liveEdge = buffered.end(buffered.length - 1);

          if (liveEdge - video.currentTime > 5) {
            video.currentTime = liveEdge - 1;
          }
        }
      });

      return () => {
        // Limpiar watchdog y reintentos
        if (watchdogInterval) clearInterval(watchdogInterval);
        if (retryTimeout) clearTimeout(retryTimeout);
        
        // Detener carga y destruir HLS
        try { hls.stopLoad(); } catch (e) {}
        hls.off(Hls.Events.MANIFEST_PARSED, handleManifestParsed);
        hls.off(Hls.Events.ERROR, handleError);
        try { hls.destroy(); } catch (e) {}
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      const handleLoadedMetadata = () => {
        video.play();
      };

      video.src = streamUrl;
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.src = "";
      };
    }
  }, []);

  // Play y pause de vídeo
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Barra de sonido
  const handleVolume = (e) => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = e.target.value;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Pantalla completa y reversa
  const handleFullScreen = () => {
    const container = document.querySelector(".video-player-container");

    if (!document.fullscreenElement) {
      if (container?.requestFullscreen) {
        container.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Actualizar transmisión en vivo
  const goToLive = () => {
    const video = videoRef.current;
    if (!video) return;
    const buffered = video.buffered;
    if (buffered.length > 0) {
      const livePoint = buffered.end(buffered.length - 1);
      video.currentTime = livePoint - 1;
    }
    video.play();
  };

  return (
    <div
      className="video-player-container"
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="player-video"
      />

      {statusMessage && (
        <div className="stream-status" style={{position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 10px', borderRadius: 4}}>
          {statusMessage}
        </div>
      )}

      {isFullscreen && title && (
        <div className={`stream-title ${showControls ? "visible" : "hidden"}`}>
          {title}
        </div>
      )}

      <div className={`player-controls ${showControls ? "visible" : "hidden"}`}>
        <div className="left-controls">
          {/* <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button> */}
          <div className="live-badge" onClick={goToLive}>
            LIVE
          </div>
        </div>

        <div className="right-controls">
          <button onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="1"
            onChange={handleVolume}
          />
          <button onClick={handleFullScreen}>⛶</button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
