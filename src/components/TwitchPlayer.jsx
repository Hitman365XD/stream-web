import { useEffect, useRef } from 'react';
import config from '../config';

function TwitchPlayer(streamer) {
    const playerRef = useRef(null);

    useEffect(() => {
        const playerElement = playerRef.current;
        const script = document.createElement('script');
        script.src = 'https://player.twitch.tv/js/embed/v1.js';
        script.onload = () => {
            if (!playerRef.current || !window.Twitch) return;

            new window.Twitch.Player(playerRef.current, {
                width: '100%',
                height: '100%',                
                channel: streamer,
                parent: [window.location.hostname || config.twitchParent],
            }).setVolume(0);
        };

        document.body.appendChild(script);

        return () => {
            script.remove();
            if (playerElement) playerElement.innerHTML = '';
        };
    }, []);

    return <div ref={playerRef} className="twitch-player" />;
}

export default TwitchPlayer;