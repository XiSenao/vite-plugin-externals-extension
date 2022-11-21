import type { PluginOption, UserConfig } from 'vite';

interface ExternalExtensionType {
  [key: string]: {
    getter?: string | ((window: any) => any);
    url: string | (() => Promise<string>);
  }
}

enum EnForceType {
  PRE = 'pre',
  POST = 'post',
}

const externalRE = /^(https?:)?\/\//;

const isExternalUrl = (url: string) => externalRE.test(url);

let tempConfig = {} as UserConfig;

const exclude: Array<string | RegExp> = [];

function externalsExtensionResolverConfigFilter(): PluginOption {
  return {
    name: "vite-plugin-externals-extension-config-filter",
    enforce: EnForceType.POST,
    async config(config: UserConfig) {
      const include = config.optimizeDeps?.include ?? [];
      include?.forEach((url, index) => {
        if (exclude.includes(url)) {
          include.splice(index, 1);
        }
      });
    }
  }
}

function externalsExtensionResolver(options: ExternalExtensionType): PluginOption {

  return {
    name: 'vite-plugin-externals-extension',
    enforce: EnForceType.PRE,

    async resolveId(id: string) {
      if (options[id] && !!options[id].getter) {
        return id;
      } else if (options[id]) {
        return options[id].url as string;
      }
      return null;
    },

    async config(config: UserConfig) {
      tempConfig = config;
      exclude.push(
        ...await Promise.all(
          Object.entries(options).filter((option) => !option[1].getter).map(async (option) => {
            option[1].url = typeof option[1].url === "function" ? await option[1].url() : option[1].url;
            return option[1].url;
          })
        )
      );
      return {
        build: {
          rollupOptions: {
            external: exclude
          }
        }
      };
    },
    
    async transformIndexHtml() {
      return Object
              .entries(options)
              .filter(option => !!option[1].getter)
              .map(option => option[1].url as string)
              .filter(isExternalUrl)
              .map(url => ({
                tag: 'script',
                attrs: {
                  src: url
                }
              }));
    },

    async load(id: string) {
      if (options[id]) {
        const { getter } = options[id] || {};
        if (typeof getter === 'function') {
          return `
            const getter = ${getter};
            const fetchGetterModule = getter(window);
            export default fetchGetterModule;
          `;
        }
        return `
          export default window['${getter}']
        `;
      }
      return null;
    }
  };
}

export function externalsExtension(options: ExternalExtensionType): PluginOption {
  return [externalsExtensionResolver(options), externalsExtensionResolverConfigFilter()];
}
