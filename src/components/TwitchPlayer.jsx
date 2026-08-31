import { useEffect, useRef } from "react";
import config from "../config";
import "./TwitchPlayer.css";

function TwitchPlayer({ channel }) {
  const twitchPlayer = useRef(null);
  const parent = config.twitchParent || window.location.hostname;

  useEffect(() => {
    if (!channel) return;
    var player = null;

    const script = document.createElement("script");
    script.src = "https://player.twitch.tv/js/embed/v1.js";
    script.async = true;

    const loadPlayer = () => {
      if (!window.Twitch || !twitchPlayer.current) return;

      player = new window.Twitch.Player(twitchPlayer.current, {
        channel: channel,
        parent: [parent],
        width: "100%",
        height: "100%",
        autoplay: true,
      });
      player.setVolume(0);
    };

    script.addEventListener("load", loadPlayer);
    document.body.appendChild(script);

    if (window.Twitch) {
      loadPlayer();
    }

    return () => {
      script.removeEventListener("load", loadPlayer);
      document.body.removeChild(script);
    };
  }, [channel]);

  return <div ref={twitchPlayer} className="twitch-player-container" />;
}

export default TwitchPlayer;
