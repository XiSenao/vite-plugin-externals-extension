[English](./README.md) | 简体中文

# vite-plugin-externals-extension

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-externals-extension"><img src="https://badgen.net/npm/v/vite-plugin-externals-extension" alt="Version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="Node Compatibility"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/license/vite-plugin-externals-extension" alt="License"></a>
 </p>

这是一个支持引入外部 `CDN` 链接的插件。作用类似于 `webpack` 中的 `external` 选项，支持 `vite` 版本包括 `2.x` 和 `3.x`。心动不如行动，快来尝试一下吧!

## 安装

```bash
pnpm install vite-plugin-externals-extension -D
```

or

```bash
yarn add vite-plugin-externals-extension -D
```

## 使用

只需要在 `vite.config` 模块中按照以下例子配置插件即可，而无需修改其他的源文件。可以引入打包成 `CJS` 或 `ESM`(推荐使用 [skypack](https://www.skypack.dev/) ) 的`CDN` 产物链接。

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
  // vite 版本在 2.2.0 以上版本无需额外注入 external.
  build: {
    rollupOptions: {
      external: await compatLowVersion()
    }
  }
})

```

⚠️ **注意:**

1. 考虑到 `ts` 对依赖模块的类型依赖和子依赖模块的`隐性注入`，项目依赖的模块依旧需要安装，不过只需要安装 `dev` 依赖即可，不会影响生产时包体积。
2. 针对依赖 `vite` 版本在 `2.0.0` ~ `2.2.0` 区间，由于不支持 `async plugin config`，因此需要手动添加 `external`。额外注入以下代码即可：

   ```js
   {
    build: {
      rollupOptions: {
        external: await compatLowVersion()
      }
    }
   }
   ```

## 配置项

插件配置项类型接口如下，通过以上例子相信你已经一目了然了吧。

```ts
interface ExternalExtensionType {
  [key: string]: {
    getter?: string | ((window: any) => any);
    url: string | (() => Promise<string>);
  }
}
```

⚠️ **注意:**

`getter` 是一个可选项。如果你要使用产物为 `ESM` 的外部链接，无需进行配置。这个属性只为了兼容不同的 `CJS` 打包产物而提供的。

`url` 是一个必选项。你可以借此提供你所需的外部 `CDN` 链接，当然如果你需要异步的能力也是支持的。

## 样例

你可以根据需求来展示或调试项目提供的例子，例子包含 [vite v3.x](https://github.com/XiSenao/vite-plugin-externals-extension/tree/main/examples/vite-v3.x) 和 [vite v2.x](https://github.com/XiSenao/vite-plugin-externals-extension/tree/main/examples/vite-v2.x) 两大版本。
