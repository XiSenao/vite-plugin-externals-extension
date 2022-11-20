import type { PluginOption, UserConfig } from 'vite';
import MagicString from 'magic-string';
import type { ImportSpecifier } from 'es-module-lexer'
import { init, parse as parseImports } from 'es-module-lexer';

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

const externalSubModuleRegExpList: [RegExp, string, string][] = [];

function externalsExtensionTransform() {
  return {
    name: 'vite-plugin-externals-extension-transform',
    enforce: EnForceType.POST,

    async transform (source: string) {
      await init
      let imports: readonly ImportSpecifier[] = []
      try {
        imports = parseImports(source)[0]
      } catch (e) {
        
      }
      if (!imports.length) {
        return null
      }
      let s: MagicString | undefined;
      const str = () => s || (s = new MagicString(source))
      for (let index = 0; index < imports.length; index++) {
        const {
          s: start,
          e: end,
          n: specifier
        } = imports[index];
        let externalSubModuleInfo: [RegExp, string, string] | undefined;
        if (specifier && (externalSubModuleInfo = externalSubModuleRegExpList.find(regExp => regExp[0].test(specifier)))) {
          const newSpecifier = externalSubModuleInfo[2] + specifier.substring(externalSubModuleInfo[1].length);
          str().overwrite(
            start,
            end,
            newSpecifier,
            {
              contentOnly: true
            }
          )
        }
      }
      if (s) {
        return {
          code: s.toString(),
          map: tempConfig.build?.sourcemap ? s.generateMap({ hires: true }) : null
        }
      }
    }
  }
}

function externalsExtensionResolver(options: ExternalExtensionType): PluginOption {
  const exclude: Array<string | RegExp> = [];

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
            // const externalSubModuleRegExp = new RegExp(`${option[0]}\/`);
            // exclude.push(externalSubModuleRegExp);
            option[1].url = typeof option[1].url === "function" ? await option[1].url() : option[1].url;
            // externalSubModuleRegExpList.push([externalSubModuleRegExp, option[0], option[1].url]);
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
  return [externalsExtensionResolver(options)];
}
