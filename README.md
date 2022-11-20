English | [简体中文](./README-zh.md)

# vite-plugin-externals-extension

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-externals-extension"><img src="https://badgen.net/npm/v/vite-plugin-externals-extension" alt="Version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="Node Compatibility"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/license/vite-plugin-externals-extension" alt="License"></a>
 </p>

A Vite/Rollup plugin which support external link.
Inspired by Webpack. Applicable to the latest version of vite (v3.2.4), enjoy!

## Running results

## Install

```bash
pnpm install vite-plugin-externals-extension -D
```

or

```bash
yarn add vite-plugin-externals-extension -D
```

## Usage

Configure plugin like the following example to take effect without modifying any other information. support configuration links including `cjs` and `esm`( recommended [skypack](https://www.skypack.dev/) links).

```ts
// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { externalsExtension } from 'vite-plugin-externals-extension'

export default defineConfig({
  plugins: [
    react(),
    externalsExtension({
      htm: {
        url: 'https://cdn.skypack.dev/htm'
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
        url: 'https://cdn.skypack.dev/pin/react@v17.0.1-yH0aYV1FOvoIPeKBbHxg/mode=imports/optimized/react.js',
      }
    })
  ]
})

```

## Configuration

The configuration type of plugin interface is as follows. The usage is a little similar to `webpack`, it may be clear at a glance through the above examples.

```ts
interface ExternalExtensionType {
  [key: string]: {
    getter?: string | ((window: any) => any);
    url: string | (() => Promise<string>);
  }
}
```

⚠️ **注意:**

`getter` is an optional attribute which is no need to configure `getter` hooks when using `ESM` links, which is created for adapt to different `CJS` packages.

`url` is a required option to configure the dependent external links you need. If you need asynchronous link need, also suits your appetite.

## Example projects

You can use the [example](https://github.com/XiSenao/vite-plugin-externals-extension/tree/main/examples) in the project to make a demonstration or debug according to your needs.
