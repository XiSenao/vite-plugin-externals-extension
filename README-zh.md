[English](./README.md) | 简体中文

# vite-plugin-externals-extension

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-externals-extension"><img src="https://badgen.net/npm/v/vite-plugin-externals-extension" alt="Version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="Node Compatibility"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/license/vite-plugin-externals-extension" alt="License"></a>
 </p>

这是一个支持引入外部 `CDN` 链接的插件。作用类似于 `webpack` 中的 `external` 选项，支持 `vite` 版本包括 `2.x` 和 `3.x`。心动不如行动，快来尝试一下吧!

> 如果你对于实现感兴趣的话，这一篇 [文章](https://juejin.cn/post/7169534783783960613) 可以作为参考。

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
  // 在 2.2.0 以上的 Vite 版本中引入 ESM 产物的 CDN 链接是不需要额外注入 external。
  build: {
    rollupOptions: {
      external: await compatLowVersion()
    }
  }
})

```

⚠️ **注意:**

1. 考虑到 `ts` 对依赖模块的类型依赖和子依赖模块的`隐性注入`，项目依赖的模块依旧需要安装，不过只需要安装 `dev` 依赖即可，不会影响生产时包体积。
2. `vite` 版本在 `2.0.0` ~ `2.2.0` 区间是不支持 `async plugin config`。若需要支持 `ESM` 产物的 `CDN` 链接，需要手动添加 `external`。额外注入以下代码即可：

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

## 快速开发

开发前首要工作如下：

```bash
# 安装所有依赖
pnpm pre
# 构建项目与软链产物
pnpm build-all
# 开发
pnpm dev
```

`examples/` 目录下提供 `vite 2.x` 和 `vite 3.x` 两个版本的项目供开发者调试，插件在构建项目阶段已经将产物软链到两个样例项目的依赖上。

```bash
cd examples
# 或者 cd vite-v3.x
cd vite-v2.x
pnpm build
```

为了优化项目开发体验，额外提供 `vite-plugin-convert-path-extension` 插件将构建输出到 `index.html` 的产物链接由原先的绝对路径改为了相对路径。因此用户在构建完成后可以直接在 `vscode` 上使用 `Open With Live Server` 的方式快速开启本地服务，检查项目构建产物是否合规也就意味着插件是否成功执行了能力。

⚠️ **注意:**

1. 若需要部署 `examples` 项目，请在 `vite.config.ts` 模块中移除 `vite-plugin-convert-path-extension` 插件。

2. `vite-plugin-convert-path-extension` 插件只会对注入到 `index.html` 中的路径做重写。也就意味着产物内在运行时通过动态注入到 `index.html` 的链接不做重写处理。

## 样例

你可以根据需求来展示或调试项目提供的例子，例子包含 [vite v3.x](https://github.com/XiSenao/vite-plugin-externals-extension/tree/main/examples/vite-v3.x) 和 [vite v2.x](https://github.com/XiSenao/vite-plugin-externals-extension/tree/main/examples/vite-v2.x) 两大版本。