const env = import.meta.env;

export default {
  streamUrl: env.VITE_STREAM_URL,
  twitchParent: env.VITE_TWITCH_PARENT,
  response: env.VITE_RESPONSE_URL,
};