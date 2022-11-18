import type { PluginOption } from 'vite';

interface ExternalExtensionType {
  [key: string]: {
    getter?: string | ((window: any) => any);
    url: string | (() => Promise<string>);
  }
}

const externalRE = /^(https?:)?\/\//;

const isExternalUrl = (url: string) => externalRE.test(url);

export function externalsExtension(options: ExternalExtensionType): PluginOption {
  const exclude: Array<string> = [];
  return {
    name: 'vite-plugin-externals-extension',
    enforce: 'pre' as ('pre' | 'post'),

    async resolveId(id: string) {
      if (options[id] && !!options[id].getter) {
        return id;
      } else if (options[id]) {
        return options[id].url as string;
      }
      return null;
    },

    async config() {
      exclude.push(
        ...await Promise.all(
          Object
            .entries(options)
            .filter(option => !option[1].getter)
            .map(async option => {
              return option[1].url = 
                typeof option[1].url === 'function' ? 
                (await option[1].url()) : 
                option[1].url;
            })
        )
      )
      return {
        build: {
          rollupOptions: {
            external: exclude
          }
        }
      }
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