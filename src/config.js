const env = import.meta.env;

export default {
  streamUrl: env.VITE_VIDEO_URL,
  twitchParent: env.VITE_TWITCH_PARENT,
  response: env.VITE_DATA_URL,
};