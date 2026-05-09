import.meta.env

const channel = import.meta.env.VITE_TWITCH_CHANNEL;
const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
const token = import.meta.env.VITE_TWITCH_TOKEN;

export const getStreamData = async () => {
  const response = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${channel}`,
    {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (data.data.length > 0) {
    return {
        viewers: data.data[0].viewer_count,
        title: data.data[0].title,
    };
  } else {
    return {
      viewers: 0,
      title: "Offline",
    };
  }
};