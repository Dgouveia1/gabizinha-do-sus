import { useState } from 'react'

export default function AddListButton({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || loading) return
    setLoading(true)
    await onAdd(title.trim())
    setTitle('')
    setOpen(false)
    setLoading(false)
  }

  if (!open) {
    return (
      <div className="flex-shrink-0 w-72">
        <button
          onClick={() => setOpen(true)}
          data-intro-step="add-list"
          className="w-full bg-white/70 hover:bg-white border border-dashed border-gray-200 hover:border-mint-300 text-gray-400 hover:text-mint-600 rounded-2xl px-4 py-3 text-sm font-medium transition-all"
        >
          + Nova coluna
        </button>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-72">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-mint-200 p-3 flex flex-col gap-2 shadow-sm">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da coluna..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400"
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        />
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-mint-500 text-white text-sm py-1.5 rounded-xl hover:bg-mint-600 transition-colors disabled:opacity-50">
            {loading ? 'Criando...' : 'Criar'}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            ✕
          </button>
        </div>
      </form>
    </div>
  )
}
