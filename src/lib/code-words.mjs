// How inline code wraps (see "Inline code wraps only between words" in docs.css). Each word goes in a `span.nw`
// that never breaks, so a long message or command wraps only at its spaces and `--default-branch` isn't split at
// its hyphen. A long word (LONG_WORD characters or more: `WEBHOOK_ALLOW_PRIVATE_ADDRESSES`, a path, a URL) is cut
// into `span.seg` pieces with a `<wbr>` between them, after `_`, `/`, `.`, `:` or a hyphen inside a word; docs.css
// lets those break only on narrow screens. A flag (a word starting with `-`) is never cut at its hyphens, and
// `//` is never split. The text is unchanged, so copying and search see the same code.
//
// Used by the Markdown plugin in astro.config.mjs (`codeChildren`, hast) and by components that write code
// themselves, like EnvTable (`codeHtml`, an HTML string).

export const LONG_WORD = 16

/** @param {string} word @returns {string[]} */
export const pieces = (word) => {
  if (word.length < LONG_WORD) return [word]
  const cut = word.startsWith('-') ? /(?<=[_/.:])(?=[^/])/ : /(?<=[_/.:]|[A-Za-z0-9]-)(?=[^/])/
  return word.split(cut)
}

/** @param {string} text @returns {string[]} words and runs of whitespace, in order */
const parts = (text) => text.split(/(\s+)/).filter(Boolean)
const isSpace = (/** @type {string} */ part) => /^\s+$/.test(part)

/** @param {string} value */
const textNode = (value) => ({ type: 'text', value })
/** @param {string} className @param {any[]} children */
const span = (className, children) => ({ type: 'element', tagName: 'span', properties: { className: [className] }, children })
const wbr = () => ({ type: 'element', tagName: 'wbr', properties: {}, children: [] })

/** The children of a `<code>` element, as hast nodes. @param {string} text */
export const codeChildren = (text) =>
  parts(text).map((part) => {
    if (isSpace(part)) return textNode(part)
    const p = pieces(part)
    return span('nw', p.length < 2 ? [textNode(part)] : p.flatMap((piece, i) => [...(i ? [wbr()] : []), span('seg', [textNode(piece)])]))
  })

/** @param {string} s */
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The inside of a `<code>` element, as an HTML string (the text is escaped). @param {string} text */
export const codeHtml = (text) =>
  parts(text)
    .map((part) => {
      if (isSpace(part)) return part
      const p = pieces(part)
      const inner = p.length < 2 ? escape(part) : p.map((piece) => `<span class="seg">${escape(piece)}</span>`).join('<wbr>')
      return `<span class="nw">${inner}</span>`
    })
    .join('')
