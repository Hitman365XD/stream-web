import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./VideoPlayer.css";

function VideoPlayer({ title }) {
  const videoRef = useRef(null);
  const hideTimer = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const resetHideTimer = () => {
    setShowControls(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2500);
  };

  useEffect(() => {
    resetHideTimer();

    return () => {
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    // Proviene del servicio para vídeo
    const video = videoRef.current;
    const streamUrl = "http://localhost/hls/test.m3u8";

    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 5,
        maxBufferLength: 6,
        maxMaxBufferLength: 6,
        backBufferLength: 10,
        liveDurationInfinity: true,
        enableWorker: false,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("Manifest cargado. Modo live forzado");
        video.play().catch((e) => console.log("Error: ", e));
      });

      // Stream detenido, forzar recarga
      hls.on(Hls.Events.ERROR, (event, data) => {
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
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;

      video.addEventListener("loadedmetadata", function () {
        video.play();
      });
    }
  }, []);

  // Barra de sonido
  const handleVolume = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const value = Number(e.target.value);
    video.volume = value;
    video.muted = value === 0;
    setIsMuted(video.muted);
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
        setIsFullScreen(true);
      }
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
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

      {isFullScreen && title && (
        <div className={`stream-title ${showControls ? "visible" : "hidden"}`}>
          {title}
        </div>
      )}

      <div className={`player-controls ${showControls ? "visible" : "hidden"}`}>
        <div className="left-controls">
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
