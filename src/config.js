const env = import.meta.env;

export default {
  streamer: env.VITE_STREAMER,
  twitchParent: env.VITE_TWITCH_PARENT,
  response: env.VITE_DATA_URL,
};