import { useEffect, useState } from "react";
import { getStreamData } from "./services/twitchService"
import { FaUser } from "react-icons/fa";
import "./App.css";

function App() {
  const [viewers, setViewers] = useState(0);
  const [title, setTitle] = useState("");

  // Credenciales
  const channel = import.meta.env.VITE_TWITCH_CHANNEL;
  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
  const token = import.meta.env.VITE_TWITCH_TOKEN;

  useEffect(() => {
    const updateStream = async () => {
      const streamData = await getStreamData();

      // Datos multimedia de transmisión
      setViewers(streamData.viewers);
      setTitle(streamData.title);
    };

    // Refresh de viewers cada 10 segundos
    const interval = setInterval(updateStream, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="app-container">
        <div className="stream-section">
          <div className="video-container">VIDEO</div>
          <div className="bottom-bar">
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
