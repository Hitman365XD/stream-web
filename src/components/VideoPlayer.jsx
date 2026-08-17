import { useEffect, useRef, useState } from "react";
import config from "../config";
import Hls from "hls.js";
import "./VideoPlayer.css";

function VideoPlayer({ title }) {
  const videoRef = useRef(null);
  const hideTimer = useRef(null);
  const lastVolumeRef = useRef(0.5);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
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
    const video = videoRef.current;
    if (!video) return;

    const updatePlayState = () => {
      setIsPlaying(!video.paused && !video.ended);
    };

    updatePlayState();
    video.addEventListener("play", updatePlayState);
    video.addEventListener("pause", updatePlayState);
    video.addEventListener("ended", updatePlayState);
    video.addEventListener("enterpictureinpicture", updatePlayState);
    video.addEventListener("leavepictureinpicture", updatePlayState);

    return () => {
      video.removeEventListener("play", updatePlayState);
      video.removeEventListener("pause", updatePlayState);
      video.removeEventListener("ended", updatePlayState);
      video.removeEventListener("enterpictureinpicture", updatePlayState);
      video.removeEventListener("leavepictureinpicture", updatePlayState);
    };
  }, []);

  useEffect(() => {
    // Proviene del servicio para vídeo
    const video = videoRef.current;
    const streamUrl = config.streamUrl;

    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        enableWorker: true,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 5,
        maxFragLookUpTolerance: 0.25,
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

    const value = Number(e.target.value);
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setIsMuted(video.muted);

    if (value > 0) {
      lastVolumeRef.current = value;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      const restoredVolume =
        lastVolumeRef.current > 0 ? lastVolumeRef.current : 0.5;
      video.volume = restoredVolume;
      video.muted = false;
      setVolume(restoredVolume);
      setIsMuted(false);
    } else {
      lastVolumeRef.current =
        video.volume > 0 ? video.volume : lastVolumeRef.current;
      video.volume = 0;
      video.muted = true;
      setVolume(0);
      setIsMuted(true);
    }
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
          <button onClick={togglePlay} title={isPlaying ? "Pausar" : "Reproducir"}>{isPlaying ? "⏸" : "▶"}</button>
          <div className="live-badge" onClick={goToLive}>
            LIVE
          </div>
        </div>

        <div className="right-controls">
          <button onClick={toggleMute} title="Volumen">
            {isMuted ? "🔇" : "🔊"}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolume}
          />
          {/* Botón de cambiar calidad de vídeo */}
          <button onClick={handleFullScreen} title="Pantalla completa">
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
