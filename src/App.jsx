import { useEffect, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import { FaUser } from "react-icons/fa";
import config from "./config";
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
      const response = await fetch(config.response);
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

  useEffect(() => {
    const setVh = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      const vh = height * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setVh);
      window.visualViewport.addEventListener("scroll", setVh);
    }

    return () => {
      window.removeEventListener("resize", setVh);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setVh);
        window.visualViewport.removeEventListener("scroll", setVh);
      }
    };
  }, []);

  useEffect(() => {
    if (streamer) {
      document.title = `${streamer}`;
    } else {
      document.title = "Stream-web";
    }
  }, [streamer]);

  useEffect(() => {
    if (!profileImage) return;

    const updateFavicon = (href) => {
      let icon = document.querySelector("link[rel~='icon']");
      if (!icon) {
        icon = document.createElement("link");
        icon.rel = "icon";
        document.head.appendChild(icon);
      }
      icon.href = href;
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = profileImage;

    img.onload = () => {
      const size = 64;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        updateFavicon(profileImage);
        return;
      }

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      ctx.restore();

      ctx.lineWidth = 4;
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
      ctx.stroke();

      updateFavicon(canvas.toDataURL("image/png"));
    };

    img.onerror = () => updateFavicon(profileImage);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [profileImage]);

  const twitchParent =
    typeof window !== "undefined"
      ? window.location.hostname
      : config.twitchParent;

  return (
    <div className="app-container">
      <div className="stream-section">
        {isLive ? (
          <VideoPlayer title={title} />
        ) : (
          <div className="offline-container">No disponible</div>
        )}
      </div>

      <div className={`chat-container ${showChat ? "" : "hidden"}`}>
        <iframe
          src={`https://www.twitch.tv/embed/${channel}/chat?parent=${twitchParent}&darkpopout`}
          className="frame-container"
        ></iframe>
      </div>

      <div className="bottom-bar">
        <a
          href={`https://www.twitch.tv/${channel}`}
          target="_blank"
          rel="noopener noreferrer"
          className="channel-container"
        >
          <img src={profileImage} alt={streamer} className="profile-image" />
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
            title={showChat ? "Ocultar chat" : "Mostrar chat"}
            aria-label={showChat ? "Ocultar chat" : "Mostrar chat"}
          >
            💬
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
