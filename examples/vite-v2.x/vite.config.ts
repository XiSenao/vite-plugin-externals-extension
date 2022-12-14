import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {
  compatLowVersion,
  externalsExtension
} from 'vite-plugin-externals-extension';
import convertPathToRelative from './src/plugins/vite-plugin-convert-path-extension';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    externalsExtension({
      react: {
        url: 'https://cdn.skypack.dev/pin/react@v17.0.1-yH0aYV1FOvoIPeKBbHxg/mode=imports/optimized/react.js'
      },
      'react-dom': {
        url: 'https://cdn.skypack.dev/pin/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/mode=imports/optimized/react-dom.js'
      }
    })
  ],
  build: {
    rollupOptions: {
      external: await compatLowVersion(),
      plugins: [convertPathToRelative()]
    }
  }
});
