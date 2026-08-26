const env = import.meta.env;

export default {
  streamId: env.VITE_ID_VIDEO,
  twitchParent: env.VITE_TWITCH_PARENT,
  response: env.VITE_DATA_URL,
};