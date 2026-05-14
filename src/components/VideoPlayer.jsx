import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./VideoPlayer.css";

function VideoPlayer() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const streamUrl = "http://localhost/hls/test.m3u8"; // Proviene del servicio para vídeo

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
    const container = document.querySelector(".video-container");

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
  };

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
    <div className="video-container">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />

      <div className="player-controls">
        <div className="left-controls">
          <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
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
