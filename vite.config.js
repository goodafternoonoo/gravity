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
        galaxy: resolve(__dirname, 'galaxy.html'),
        cloth: resolve(__dirname, 'cloth.html'),
        fireworks: resolve(__dirname, 'fireworks.html'),
        voyage: resolve(__dirname, 'voyage.html'),
        pendulum: resolve(__dirname, 'pendulum.html'),
        jelly: resolve(__dirname, 'jelly.html'),
        brush: resolve(__dirname, 'brush.html'),
        about: resolve(__dirname, 'about.html'),
      },
    },
  },
})
