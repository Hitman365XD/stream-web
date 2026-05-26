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

  useEffect(() => {
    const video = videoRef.current;
    const streamUrl = "http://localhost/hls/test.m3u8";

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
    const streamUrl = "http://localhost/hls/test.m3u8";

    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        liveSyncDurationCount: 1,
        liveMaxLatencyDurationCount: 3,
        maxBufferLength: 2,
        maxMaxBufferLength: 4,
        backBufferLength: 0,
        maxFragLookUpTolerance: 0.1,
        enableWorker: true,
        capLevelToPlayerSize: true,
        autoStartLoad: true,
        fragLoadingTimeOut: 10000,
        manifestLoadingTimeOut: 5000,
        nudgeOffset: 0.05,
      });

      const handleManifestParsed = () => {
        console.log("Manifest cargado. Modo live forzado");
        video.play().catch((e) => console.log("Error: ", e));
      };

      const handleError = (event, data) => {
        if (data.fatal) {
          console.warn("Intentando recuperar");

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
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

      return () => {
        hls.off(Hls.Events.MANIFEST_PARSED, handleManifestParsed);
        hls.off(Hls.Events.ERROR, handleError);
        hls.destroy();
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
        muted={false}
        playsInline
        className="player-video"
      />

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
