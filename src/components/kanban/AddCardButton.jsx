import { useState } from 'react'

export default function AddCardButton({ onAdd }) {
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
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors"
      >
        + Adicionar tarefa
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-1">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título da tarefa..."
        className="w-full rounded-xl border border-mint-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400"
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-mint-500 text-white text-sm py-1.5 rounded-xl hover:bg-mint-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Adicionando...' : 'Adicionar'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          ✕
        </button>
      </div>
    </form>
  )
}
