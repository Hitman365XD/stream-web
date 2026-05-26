import { useEffect, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import { FaUser } from "react-icons/fa";
import "./App.css";

function App() {
  const [viewers, setViewers] = useState(0);
  const [title, setTitle] = useState("");
  const [streamer, setStreamer] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isLive, setIsLive] = useState();
  const [channel, setChannel] = useState("");
  const [showChat, setShowchat] = useState(true);

  useEffect(() => {
    const updateStream = async () => {
      // Credenciales
      const response = await fetch("http://localhost:3000/stream-data");      
      const streamData = await response.json();

      // Datos multimedia de transmisión
      setChannel(streamData.channel);
      setIsLive(streamData.isLive);
      setViewers(streamData.viewers);
      setTitle(streamData.title);
      setStreamer(streamData.streamer);
      setProfileImage(streamData.profileImage);
    };

    updateStream();

    // Refresh de viewers cada 10 segundos
    const interval = setInterval(updateStream, 10000);
    return () => clearInterval(interval);
  }, []);

  const twitchParent = typeof window !== "undefined" ? window.location.hostname : "localhost";

  return (
    <>
      <div className="app-container">
        <div className="stream-section">
          {isLive ? (
            <VideoPlayer title={title} />
          ) : (
            <div className="offline-container">No disponible</div>
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
              <span className="streamer-name desktop-only">{streamer}</span>
              <span className="channel-name mobile-only">{channel}</span>
            </a>
            <div className="title-container">{title}</div>
            <div className="right-controls">
              <div className="views-container">
                <span className="views-icon">
                  <FaUser />
                </span>
                <span className="views-value">{viewers}</span>
              </div>
              <button
                className={`chat-toggle ${showChat ? "active" : ""}`}
                onClick={() => setShowchat(!showChat)}
              >
                💬
              </button>
            </div>
          </div>
        </div>

        <div className={`chat-container ${showChat ? "" : "hidden"}`}>
          <iframe
            src={`https://www.twitch.tv/embed/${channel}/chat?parent=${twitchParent}&darkpopout`}
            className="frame-container"
          ></iframe>
        </div>
      </div>
    </>
  );
}

export default App;
