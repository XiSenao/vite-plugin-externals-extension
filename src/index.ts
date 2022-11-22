import type { Plugin, UserConfig } from 'vite';

interface ExternalExtensionType {
  [key: string]: {
    getter?: string | ((window: any) => any);
    url: string | (() => Promise<string>);
  };
}

enum EnForceType {
  PRE = 'pre',
  POST = 'post'
}

const externalRE = /^(https?:)?\/\//;

const isExternalUrl = (url: string) => externalRE.test(url);

const exclude: Array<string | RegExp> = [];

let tempOptions: ExternalExtensionType = {};

function externalsExtensionResolverConfigFilter(): Plugin {
  return {
    name: 'vite-plugin-externals-extension-config-filter',
    enforce: EnForceType.POST,
    async config(config: UserConfig) {
      const include = config.optimizeDeps?.include ?? [];
      include?.forEach((url, index) => {
        if (exclude.includes(url)) {
          include.splice(index, 1);
        }
      });
    }
  };
}

async function getExcludeUrls(options: ExternalExtensionType) {
  if (exclude.length) {
    return exclude;
  }
  exclude.push(
    ...(await Promise.all(
      Object.entries(options)
        .filter((option) => !option[1].getter)
        .map(async (option) => {
          option[1].url =
            typeof option[1].url === 'function'
              ? await option[1].url()
              : option[1].url;
          return option[1].url;
        })
    ))
  );
  return exclude;
}

function externalsExtensionResolver(options: ExternalExtensionType): Plugin {
  tempOptions = options;
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

    async config() {
      return {
        build: {
          rollupOptions: {
            external: await getExcludeUrls(tempOptions)
          }
        }
      };
    },

    async transformIndexHtml() {
      return Object.entries(options)
        .filter((option) => !!option[1].getter)
        .map((option) => option[1].url as string)
        .filter(isExternalUrl)
        .map((url) => ({
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

export async function compatLowVersion(): Promise<(string | RegExp)[]> {
  return await getExcludeUrls(tempOptions);
}

export function externalsExtension(options: ExternalExtensionType): Plugin[] {
  return [
    externalsExtensionResolver(options),
    externalsExtensionResolverConfigFilter()
  ];
}
