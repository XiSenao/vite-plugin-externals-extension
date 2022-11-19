import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { externalsExtension } from 'vite-plugin-externals-extension'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    externalsExtension({
      confetti: {
        url: 'https://cdn.skypack.dev/canvas-confetti'
      },
      lodash: {
        url: 'https://cdn.skypack.dev/lodash',
      },
      redux: {
        getter: (window) => {
          return window.Redux;
        },
        url: 'https://cdn.bootcdn.net/ajax/libs/redux/4.2.0/redux.min.js'
      },
      react: {
        url: 'https://cdn.skypack.dev/react',
      }
    })
  ]
})
