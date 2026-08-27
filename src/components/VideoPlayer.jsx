import config from "../config";
import "./VideoPlayer.css";

function VideoPlayer() {
  const streamId = config.streamId;
  
  return (
    <div className="video-player-container">
      <iframe
        src={`//ok.ru/videoembed/${streamId}?nochat=1`}
        frameborder="0"
        allow="autoplay"
        className="player-video"
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default VideoPlayer;
