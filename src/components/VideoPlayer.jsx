import config from "../config";
import "./VideoPlayer.css";

function VideoPlayer() {
  const streamId = config.streamId;

  return (
    <iframe
      src={`//ok.ru/videoembed/${streamId}?nochat=1&autoplay=1`}
      frameborder="0"
      allow="autoplay"
      className="player-video"
      allowFullScreen
    ></iframe>
  );
}

export default VideoPlayer;
