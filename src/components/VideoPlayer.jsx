import { useEffect, useRef, useState } from "react";
import config from "../config";
import Hls from "hls.js";
import "./VideoPlayer.css";

function VideoPlayer({ title }) {
  const videoRef = useRef(null);
  const streamId = config.streamId;

  useEffect(() => {
    // Proviene del servicio para vídeo
    const video = videoRef.current;

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
      video.addEventListener("loadedmetadata", function () {
        video.play();
      });
    }
  }, []);

  return (
    <div className="video-player-container">
      <iframe
        src={`//ok.ru/videoembed/${streamId}?nochat=1`}
        frameborder="0"
        allow="autoplay"
        className="player-video"
      ></iframe>
    </div>
  );
}

export default VideoPlayer;
