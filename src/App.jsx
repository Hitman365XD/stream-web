import { useEffect, useState } from "react";
import { getStreamData } from "./services/twitchService";
import VideoPlayer from "./components/VideoPlayer";
import { FaUser } from "react-icons/fa";
import "./App.css";

function App() {
  const [viewers, setViewers] = useState(0);
  const [title, setTitle] = useState("");
  const [streamer, setStreamer] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isLive, setIsLive] = useState();

  // Credenciales
  const channel = import.meta.env.VITE_TWITCH_CHANNEL;

  useEffect(() => {
    const updateStream = async () => {
      const streamData = await getStreamData();

      // Datos multimedia de transmisión
      setIsLive(streamData.isLive);
      setViewers(streamData.viewers);
      setTitle(streamData.title);
      setStreamer(streamData.streamer);
      setProfileImage(streamData.profileImage);      
    };

    // Refresh de viewers cada 10 segundos
    const interval = setInterval(updateStream, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="app-container">
        <div className="stream-section">
          {isLive ? (
            <VideoPlayer />
          ) : (
            <div className="offline-container">
              No disponible
            </div>
          )}
          <div className="bottom-bar">
            <a
              href={`https://www.twitch.tv/${channel}`}
              target="_blank"
              rel="noopener noreferrer"
              className="channel-container"
            >
              <img
                src={profileImage}
                alt={streamer}
                className="profile-image"
              />
              <span className="streamer-name">{streamer}</span>
            </a>
            <div className="title-container">{title}</div>
            <div className="views-container">
              <FaUser /> {viewers}
            </div>
          </div>
        </div>

        <div className="chat-container">
          <iframe
            src={`https://www.twitch.tv/embed/${channel}/chat?parent=localhost&darkpopout`}
            className="frame-container"
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default App;
