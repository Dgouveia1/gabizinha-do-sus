import { useState, useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function CardChecklist({ items, onAdd, onToggle, onRemove }) {
  const [newText, setNewText] = useState('')
  const [adding, setAdding] = useState(false)
  const done = items.filter((i) => i.is_done).length
  const total = items.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const prevDone = useRef(done)

  useEffect(() => {
    const wasAllDone = total > 0 && prevDone.current === total
    const isAllDone = total > 0 && done === total
    if (isAllDone && !wasAllDone) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#bbf7d0', '#7dd3fc', '#f9a8d4', '#4ade80', '#f472b6'],
      })
    }
    prevDone.current = done
  }, [done, total])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newText.trim()) return
    await onAdd(newText.trim())
    setNewText('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          ☑️ Checklist
          {total > 0 && (
            <span className="text-xs font-normal text-gray-400">{done}/{total}</span>
          )}
        </h4>
      </div>

      {total > 0 && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
          <div
            className="bg-mint-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5 mb-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={item.is_done}
              onChange={(e) => onToggle(item.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-mint-500 accent-mint-500 flex-shrink-0"
            />
            <span className={`text-sm flex-1 ${item.is_done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {item.text}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            autoFocus
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Novo item..."
            className="flex-1 text-sm border border-mint-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-mint-400"
            onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
          />
          <button type="submit" className="text-sm bg-mint-500 text-white px-3 py-1.5 rounded-xl hover:bg-mint-600 transition-colors">
            Ok
          </button>
          <button type="button" onClick={() => setAdding(false)} className="text-sm text-gray-400 hover:text-gray-600 px-2 py-1.5">
            ✕
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-sm text-gray-400 hover:text-mint-600 transition-colors"
        >
          + Adicionar item
        </button>
      )}
    </div>
  )
}
