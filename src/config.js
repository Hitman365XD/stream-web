const env = import.meta.env;

export default {
  twitchParent: env.VITE_TWITCH_PARENT,
  response: env.VITE_DATA_URL,
};