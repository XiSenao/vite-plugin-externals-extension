const externalRE = /^(https?:)?\/\//;
const isExternalUrl = (url) => externalRE.test(url);
export function externalsExtension(options) {
    const exclude = [];
    return {
        name: 'vite-plugin-externals-extension',
        enforce: 'pre',
        async resolveId(id) {
            if (options[id] && !!options[id].getter) {
                return id;
            }
            else if (options[id]) {
                return options[id].url;
            }
            return null;
        },
        async config() {
            exclude.push(...await Promise.all(Object
                .entries(options)
                .filter(option => !option[1].getter)
                .map(async (option) => {
                return option[1].url =
                    typeof option[1].url === 'function' ?
                        (await option[1].url()) :
                        option[1].url;
            })));
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
                .map(option => option[1].url)
                .filter(isExternalUrl)
                .map(url => ({
                tag: 'script',
                attrs: {
                    src: url
                }
            }));
        },
        async load(id) {
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
