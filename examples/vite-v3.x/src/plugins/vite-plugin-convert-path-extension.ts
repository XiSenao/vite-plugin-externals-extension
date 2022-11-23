import type { Plugin } from 'vite'
import type { DefaultTreeAdapterMap, Token } from 'parse5'
import MagicString from 'magic-string'
import path from 'path';

enum EnForceType {
  PRE = 'pre',
  POST = 'post'
}

function nodeIsElement(
  node: DefaultTreeAdapterMap['node']
): node is DefaultTreeAdapterMap['element'] {
  return node.nodeName[0] !== '#'
}

function traverseNodes(
  node: DefaultTreeAdapterMap['node'],
  visitor: (node: DefaultTreeAdapterMap['node']) => void
) {
  visitor(node)
  if (
    nodeIsElement(node) ||
    node.nodeName === '#document' ||
    node.nodeName === '#document-fragment'
  ) {
    node.childNodes.forEach((childNode) => traverseNodes(childNode, visitor))
  }
}

async function traverseHtml(
  html: string,
  visitor: (node: DefaultTreeAdapterMap['node']) => void
): Promise<void> {
  const { parse } = await import('parse5')
  const ast = parse(html, {
    sourceCodeLocationInfo: true,
    onParseError: () => {}
  })
  traverseNodes(ast, visitor)
}

function getScriptInfo(node: DefaultTreeAdapterMap['element']): {
  src: Token.Attribute | undefined
  sourceCodeLocation: Token.Location | undefined
} {
  let src: Token.Attribute | undefined
  let sourceCodeLocation: Token.Location | undefined
  for (const p of node.attrs) {
    if (p.prefix !== undefined) continue
    if (p.name === 'src') {
      if (!src) {
        src = p
        sourceCodeLocation = node.sourceCodeLocation?.attrs!['src']
      }
    }
  }
  return { src, sourceCodeLocation }
}

const attrValueStartRE = /=\s*(.)/

function overwriteAttrValue(
  s: MagicString,
  sourceCodeLocation: Token.Location,
  newValue: string
): MagicString {
  const srcString = s.slice(
    sourceCodeLocation.startOffset,
    sourceCodeLocation.endOffset
  )
  const valueStart = srcString.match(attrValueStartRE)
  if (!valueStart) {
    // overwrite attr value can only be called for a well-defined value
    throw new Error(
      `[vite:html] internal error, failed to overwrite attribute value`
    )
  }
  const wrapOffset = valueStart[1] === '"' || valueStart[1] === "'" ? 1 : 0
  const valueOffset = valueStart.index! + valueStart[0].length - 1
  s.update(
    sourceCodeLocation.startOffset + valueOffset + wrapOffset,
    sourceCodeLocation.endOffset - wrapOffset,
    newValue
  )
  return s
}

const assetAttrsConfig: Record<string, string[]> = {
  link: ['href'],
  video: ['src', 'poster'],
  source: ['src', 'srcset'],
  img: ['src', 'srcset'],
  image: ['xlink:href', 'href'],
  use: ['xlink:href', 'href']
}

function getAttrKey(attr: Token.Attribute): string {
  return attr.prefix === undefined ? attr.name : `${attr.prefix}:${attr.name}`
}

export default function convertPathToRelative(): Plugin {
  return {
    name: 'vite-plugin-convert-path-extension',
    enforce: EnForceType.POST,
    async generateBundle(options, bundle) {
      const outputDir = options?.dir ?? '';
      if (outputDir.indexOf(process.cwd()) === 0) {
        const replaceBundleNameMap = new Map();
        Object.keys(bundle).forEach(chunk => {
          if (!/.html$/.test(chunk)) {
            const newBundleName = './' + chunk;
            replaceBundleNameMap.set(chunk, newBundleName);
          }
        });
        await Promise.all(Object.keys(bundle).map(async chunkName => {
          if (/.html$/.test(chunkName)) {
            const targetChunk = bundle[chunkName];
            // @ts-ignore
            const html = targetChunk.source;
            const s = new MagicString(html);
    
            await traverseHtml(html, (node) => {
              const assetAttrs = assetAttrsConfig[node.nodeName]
              if (!nodeIsElement(node)) {
                return
              }
              if (node.nodeName === 'script') {
                const { src, sourceCodeLocation } = getScriptInfo(node);
                if (src && replaceBundleNameMap.has(src!.value.slice(1))) {
                  overwriteAttrValue(
                    s,
                    sourceCodeLocation!,
                    replaceBundleNameMap.get(src!.value.slice(1))
                  )
                }
              } else if (assetAttrs) {
                for (const p of node.attrs) {
                  const attrKey = getAttrKey(p)
                  if (p.value && assetAttrs.includes(attrKey)) {
                    const attrSourceCodeLocation = node.sourceCodeLocation!.attrs![attrKey]
                    const url = decodeURI(p.value)
                    if (replaceBundleNameMap.has(url.slice(1)) || url.startsWith('/')) {
                      overwriteAttrValue(
                        s,
                        attrSourceCodeLocation,
                        replaceBundleNameMap.get(url.slice(1)) || ('.' + url)
                      )
                    }
                  }
                }
              }
            });
            // @ts-ignore
            targetChunk.source = s.toString();
          }
        }))
      }
    }
  };
}