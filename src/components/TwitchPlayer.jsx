import { useEffect, useRef, useState } from "react";
import config from "../config";
import "./TwitchPlayer.css";

const SCRIPT_SRC = "https://player.twitch.tv/js/embed/v1.js";

function loadTwitchScript() {
  if (window.Twitch) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
  });
}

function Player({ channel }) {
  const twitchPlayer = useRef(null);
  const parent = config.twitchParent || window.location.hostname;

  useEffect(() => {
    const el = twitchPlayer.current;
    let cancelled = false;

    loadTwitchScript().then(() => {
      if (cancelled) return;
      new window.Twitch.Player(el, {
        channel: channel,
        parent: [parent],
        width: "100%",
        height: "100%",
        autoplay: true,
        muted: true,
      });
    });

    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, [channel]);

  return <div ref={twitchPlayer} className="twitch-player-container" />;
}

function TwitchPlayer({ channel }) {
  const [session, setSession] = useState(0);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") setSession((n) => n + 1);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return <Player key={session} channel={channel} />;
}

export default TwitchPlayer;