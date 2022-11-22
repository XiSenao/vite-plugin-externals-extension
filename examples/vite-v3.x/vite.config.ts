import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { externalsExtension } from 'vite-plugin-externals-extension';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    externalsExtension({
      htm: {
        url: 'https://cdn.skypack.dev/htm'
      },
      lodash: {
        url: 'https://cdn.skypack.dev/lodash'
      },
      redux: {
        getter: (window) => {
          return window.Redux;
        },
        url: 'https://cdn.bootcdn.net/ajax/libs/redux/4.2.0/redux.min.js'
      },
      react: {
        url: 'https://cdn.skypack.dev/react'
      },
      /**
       * react-dom 会依赖 react 模块, 在开发阶段若不通过 skypack 引入
       * 会存在两个 react 实例，从而导致出现运行是错误。
       */
      'react-dom': {
        url: 'https://cdn.skypack.dev/react-dom'
      }
    })
  ]
});
