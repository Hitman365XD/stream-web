import config from "../config";
import "./VideoPlayer.css";

function VideoPlayer() {
  return (
    <div className="video-player-container">
      <iframe
        src={`https://live.vkvideo.ru/app/embed/${config.streamer}`}
        frameborder="0"
        allow="autoplay; fullscreen"
        className="player-video"
        allowfullscreen
      ></iframe>
    </div>
  );
}

export default VideoPlayer;
