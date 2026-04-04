import { useState } from 'react'

export default function CardLinks({ links, onAdd, onRemove }) {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const [urlError, setUrlError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    if (!url.trim()) return
    try {
      new URL(url.trim())
    } catch {
      setUrlError('URL inválida. Use o formato https://...')
      return
    }
    setUrlError('')
    await onAdd(url.trim(), label.trim())
    setUrl('')
    setLabel('')
    setAdding(false)
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">🔗 Links</h4>

      <div className="flex flex-col gap-1.5 mb-3">
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-sky-600 hover:underline flex-1 truncate"
            >
              {link.label || link.url}
            </a>
            <button
              onClick={() => onRemove(link.id)}
              className="text-gray-300 hover:text-red-400 text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <input
            autoFocus
            value={url}
            onChange={(e) => { setUrl(e.target.value); setUrlError('') }}
            placeholder="https://..."
            type="url"
            className="text-sm border border-mint-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-mint-400"
            required
          />
          {urlError && <p className="text-xs text-pink-500">{urlError}</p>}
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Rótulo (opcional)"
            className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-mint-400"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 text-sm bg-mint-500 text-white py-1.5 rounded-xl hover:bg-mint-600 transition-colors">
              Adicionar
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5">
              ✕
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-sm text-gray-400 hover:text-mint-600 transition-colors">
          + Adicionar link
        </button>
      )}
    </div>
  )
}
