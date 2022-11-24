English | [简体中文](./README-zh.md)

# vite-plugin-externals-extension

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-externals-extension"><img src="https://badgen.net/npm/v/vite-plugin-externals-extension" alt="Version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="Node Compatibility"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/license/vite-plugin-externals-extension" alt="License"></a>
 </p>

A `Vite/Rollup` plugin which support external link.
Inspired by Webpack. Support for `vite` versions including `2.x` and `3.x`, enjoy!

> If you are interested in implementation, this [article](https://juejin.cn/post/7169534783783960613) can be used as a reference.

## Install

```bash
pnpm install vite-plugin-externals-extension -D
```

or

```bash
yarn add vite-plugin-externals-extension -D
```

## Usage

Configure plugin like the following example to take effect without modifying any other information. support configuration links including `CJS` and `ESM`( recommended [skypack](https://www.skypack.dev/) links).

```ts
// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compatLowVersion, externalsExtension } from 'vite-plugin-externals-extension'

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
  ],
  /**
   *  The CDN url to use ESM products in versions of Vite above 
   *  2.2.0 does not require additional external injection.
   **/ 
  build: {
    rollupOptions: {
      external: await compatLowVersion()
    }
  }
})

```

⚠️ **Note:**

1. Considering the type dependency of `ts` on dependent modules and the `hidden injection` of sub-dependent modules, the modules that the project depends still need to be installed, but only need to install `dev' dependencies, which will not affect the package size at the time of production.
2. The `vite` version does not support `async plugin config` in the `2.0.0` ~ `2.2.0` interval. If you need to support the `CDN` url of the `ESM` product, you need to manually add `external`. Just inject the following code:

  ```js
   {
    build: {
      rollupOptions: {
        external: await compatLowVersion()
      }
    }
   }
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

⚠️ **Note:**

`getter` is an optional attribute which is no need to configure `getter` hooks when using `ESM` links, which is created for adapt to different `CJS` packages.

`url` is a required option to configure the dependent external links you need. If you need asynchronous link need, also suits your appetite.

## Quick Dev

The first tasks before development are as follows:

```bash
# Install all dependencies
pnpm pre
# Build projects and soft link products
pnpm build-all
# Turn on development mode
pnpm dev
```

The `vite 2.x` and `vite 3.x` versions of the project are available for developers to debug under the `examples/` directory, and the plugin has soft link the product to the dependencies of two sample projects during the build project.

```bash
cd examples
# or `cd vite-v3.x`
cd vite-v2.x
pnpm build
```

In order to optimize the project development experience, the additional `vite-plugin-convert-path-extension` plugin will change the product link of the build output to `index.html` from the original absolute path to the relative path. Therefore, after the build is completed, users can quickly open the local service directly using `Open With Live Server` on `vscode`. Checking whether the project build product is as expected also means that the plugin has successfully executed.

⚠️ **Note:**

1. If you need to deploy the `examples` project, please remove `vite-plugin-convert-path-extens` plugin in the `vite.config.ts` module.
2. The `vite-plugin-convert-path-extension` plugin will only rewrite the path injected into "index.html". This means that the url dynamically injected into "index.html" at runtime of the product is not rewritten.

## Example projects

You can use the [example v2.x](https://github.com/XiSenao/vite-plugin-externals-extension/tree/main/examples/vite-v2.x) or the [example v3.x](https://github.com/XiSenao/vite-plugin-externals-extension/tree/main/examples/vite-v3.x) in the project to make a demonstration or debug according to your needs.
