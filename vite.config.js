import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        orbit: resolve(__dirname, 'orbit.html'),
        swarm: resolve(__dirname, 'swarm.html'),
        audio: resolve(__dirname, 'audio.html'),
        fluid: resolve(__dirname, 'fluid.html'),
        typo: resolve(__dirname, 'typo.html'),
      },
    },
  },
})
