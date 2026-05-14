import.meta.env;

const channel = import.meta.env.VITE_TWITCH_CHANNEL;
const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
const token = import.meta.env.VITE_TWITCH_TOKEN;

export const getStreamData = async () => {
  const headers = {
    "Client-ID": clientId,
    Authorization: `Bearer ${token}`,
  };

  try {
    // Datos del stream
    const streamRes = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${channel}`,
      { headers },
    );
    const streamData = await streamRes.json();

    // Datos del streamer
    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${channel}`,
      { headers },
    );
    const userData = await userRes.json();

    return {
      streamer: userData.data[0].display_name,
      profileImage: userData.data[0].profile_image_url,
      viewers: streamData.data[0]?.viewer_count || 0,
      title: streamData.data[0]?.title || "OFFLINE",
      isLive: streamData.data.length > 0 ? true : false,
    }
  } catch (error) {
    console.error(error);
  }
};
