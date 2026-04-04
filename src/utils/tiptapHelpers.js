/**
 * Recursively extract plain text from TipTap JSON document.
 */
export function extractPlainText(doc) {
  if (!doc) return ''
  const texts = []
  function walk(node) {
    if (node.text) texts.push(node.text)
    if (node.content) node.content.forEach(walk)
  }
  walk(doc)
  return texts.join(' ')
}

/**
 * Extract headings (H1-H3) from TipTap JSON for the table of contents.
 * Returns [{ level, text, index }]
 */
export function extractHeadings(doc) {
  const headings = []
  if (!doc?.content) return headings
  doc.content.forEach((node, index) => {
    if (node.type === 'heading') {
      const text = node.content?.map((c) => c.text || '').join('') || ''
      if (text.trim()) {
        headings.push({ level: node.attrs?.level || 1, text, index })
      }
    }
  })
  return headings
}
