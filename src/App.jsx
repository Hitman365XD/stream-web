import { useEffect, useRef, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import TwitchPlayer from "./components/TwitchPlayer";
import { FaEllipsisV, FaUser } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import {
  FaTwitch,
  FaInstagram,
  FaXTwitter,
  FaTiktok,
  FaYoutube,
  FaPatreon,
  FaEye,
  FaGift,
  FaWallet,
  FaDiscord,
  FaSpotify,
} from "react-icons/fa6";
import { CiStreamOn } from "react-icons/ci";
import { SiStreamlabs, SiMyanimelist } from "react-icons/si";
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
  const [changeScreen, setChangeScreen] = useState(false);
  const [showChannelOptions, setShowChannelOptions] = useState(false);
  const [showMenuOptions, setshowMenuOptions] = useState(null);
  const channelOptionsRef = useRef(null);

  const closeChannelOptions = () => {
    setShowChannelOptions(false);
    setshowMenuOptions(null);
  };

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
    const closeMenuWhenClickingOutside = (event) => {
      if (
        channelOptionsRef.current &&
        !channelOptionsRef.current.contains(event.target)
      ) {
        closeChannelOptions();
      }
    };

    document.addEventListener("mousedown", closeMenuWhenClickingOutside);
    return () =>
      document.removeEventListener("mousedown", closeMenuWhenClickingOutside);
  }, []);

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
    <div className={`app-container ${showChat ? "" : "chat-hidden"}`}>
      <div className="stream-section">
        <div className="video-player-container">
          {isLive ? (
            <VideoPlayer />
          ) : (
            <div className="offline-container">Offline</div>
          )}
        </div>
      </div>

      <div className={`elements-container ${showChat ? "" : "hidden"}`}>
        <div className="twitch-shell">
          <TwitchPlayer channel={channel} />
        </div>
        <iframe
          src={`https://www.twitch.tv/embed/${channel}/chat?parent=${twitchParent}&darkpopout`}
          className="chat-container"
        ></iframe>
      </div>

      <div className="bottom-bar">
        <div className="channel-actions">
          <a
            href={`https://www.twitch.tv/${channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="channel-container"
          >
            <img src={profileImage} alt={streamer} className="profile-image" />
            <span className="streamer-name desktop-only">{streamer}</span>
            <span className="channel-name mobile-only">{streamer}</span>
          </a>
          <div className="channel-options-wrapper" ref={channelOptionsRef}>
            <button
              type="button"
              className="channel-options-button"
              onClick={() => {
                setShowChannelOptions(!showChannelOptions);
              }}
              aria-label="Ver contenido del canal"
              aria-expanded={showChannelOptions}
              title="Ver contenido del canal"
            >
              <FaEllipsisV aria-hidden="true" />
            </button>
            {showChannelOptions && (
              <div
                className="channel-options-backdrop"
                onClick={closeChannelOptions}
              >
                <div
                  className="channel-options"
                  role="menu"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div
                    className="multioption-option"
                    onMouseEnter={() => setshowMenuOptions("redes")}
                  >
                    <button
                      type="button"
                      className="multioption-toggle"
                      onClick={() =>
                        setshowMenuOptions(
                          showMenuOptions === "redes" ? null : "redes",
                        )
                      }
                      aria-expanded={showMenuOptions === "redes"}
                      role="menuitem"
                    >
                      <CiStreamOn aria-hidden="true" /> Redes
                    </button>
                    <div className="multioption-submenu" role="menu">
                      <a
                        href="https://www.tiktok.com/@elfuanza"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                      >
                        <FaTiktok aria-hidden="true" /> TikTok
                      </a>
                      <a
                        href="https://x.com/elfuanza"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                      >
                        <FaXTwitter aria-hidden="true" /> Twitter
                      </a>
                      <a
                        href="https://open.spotify.com/user/jjduran1997?si=2335ded4500441b4"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                      >
                        <FaSpotify aria-hidden="true" /> Spotify
                      </a>
                      <a
                        href="https://www.instagram.com/elfuanza"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                      >
                        <FaInstagram aria-hidden="true" /> Instagram
                      </a>
                      <a
                        href="https://myanimelist.net/profile/FuanZa"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                      >
                        <SiMyanimelist aria-hidden="true" /> MyAnimeList
                      </a>
                    </div>
                  </div>
                  <div
                    className="multioption-option"
                    onMouseEnter={() => setshowMenuOptions("patreon")}
                  >
                    <button
                      type="button"
                      className="multioption-toggle"
                      onClick={() =>
                        setshowMenuOptions(
                          showMenuOptions === "patreon" ? null : "patreon",
                        )
                      }
                      aria-expanded={showMenuOptions === "patreon"}
                      role="menuitem"
                    >
                      <FaPatreon aria-hidden="true" /> Patreon
                    </button>
                    <div className="multioption-submenu" role="menu">
                      <a
                        href="https://www.patreon.com/cw/FuanZa"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                      >
                        <FaEye aria-hidden="true" /> Visitar
                      </a>
                      <a
                        href="https://www.patreon.com/cw/FuanZa/membership"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                      >
                        <FaWallet aria-hidden="true" /> Suscribirse
                      </a>
                      <a
                        href="https://www.patreon.com/FuanZa/gift"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                      >
                        <FaGift aria-hidden="true" /> Sub de regalo
                      </a>
                      <a
                        href="https://docs.google.com/spreadsheets/d/1Q776gK6Q__aplbYvGGySEGOIcuWPdFLEXTW_GkKgev4/edit?gid=1900000001#gid=1900000001"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="menuitem"
                      >
                        <FaFileExcel aria-hidden="true" /> Lista de animes
                      </a>
                    </div>
                  </div>
                  <a
                    href="https://www.youtube.com/c/FuanZa"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                  >
                    <FaYoutube aria-hidden="true" /> YouTube
                  </a>
                  <a
                    href="https://discord.gg/TXdeWMszhp"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                  >
                    <FaDiscord aria-hidden="true" /> Discord
                  </a>
                  <a
                    href="https://streamlabs.com/elfuanza/tip"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                  >
                    <SiStreamlabs aria-hidden="true" /> Donar (PayPal)
                  </a>
                  <a
                    href="https://www.twitch.tv/products/elfuanza"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                  >
                    <FaTwitch aria-hidden="true" /> Suscribirse
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="title-container">{title}</div>
        <div className="right-controls">
          <div className="views-container">
            <span className="views-icon">
              <FaUser />
            </span>
            <span className="views-value"> {viewers}</span>
          </div>
          {/* <button
            className="change-toggle"
            onClick={() => setChangeScreen(!changeScreen)}
            title="Cambiar pantallas"
          >
            <span className="change-icon">
              <MdOutlinePublishedWithChanges />
            </span>
          </button> */}
          <button
            className={`chat-toggle ${showChat ? "active" : ""}`}
            onClick={() => setShowchat(!showChat)}
            title={showChat ? "Ocultar" : "Mostrar"}
            aria-label={showChat ? "Ocultar" : "Mostrar"}
          >
            <span className="chat-toggle-track">
              <span className="chat-toggle-thumb" />
            </span>
            <span className="chat-toggle-label">Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
