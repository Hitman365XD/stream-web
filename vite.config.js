import { defineConfig } from 'vite'
import config from "./src/config/config.js";
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '',
    allowedHosts: [config.twitchParent],
  }
})
