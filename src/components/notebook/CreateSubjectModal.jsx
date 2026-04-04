import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const semesters = Array.from({ length: 12 }, (_, i) => i + 1)
const colors = [
  { value: 'mint', label: 'Verde', class: 'bg-mint-400' },
  { value: 'sky', label: 'Azul', class: 'bg-sky-400' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-400' },
  { value: 'lavender', label: 'Roxo', class: 'bg-lavender-400' },
  { value: 'sand', label: 'Amarelo', class: 'bg-sand-400' },
]
const emojis = ['📘', '📗', '📕', '📙', '📓', '🩺', '💊', '🫀', '🧠', '🦴', '🔬', '🧬']

export default function CreateSubjectModal({ open, onClose, onCreate, editData }) {
  const [title, setTitle] = useState(editData?.title || '')
  const [semester, setSemester] = useState(editData?.semester?.toString() || '')
  const [color, setColor] = useState(editData?.color || 'mint')
  const [emoji, setEmoji] = useState(editData?.emoji || '📘')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return setError('Digite o nome da materia.')
    setLoading(true)
    setError('')
    const result = await onCreate({
      title: title.trim(),
      semester: semester ? Number(semester) : null,
      color,
      emoji,
    })
    if (result?.error) setError(result.error)
    else {
      setTitle('')
      setSemester('')
      setColor('mint')
      setEmoji('📘')
      onClose()
    }
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title={editData ? 'Editar Materia' : 'Nova Materia'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome da materia *"
          placeholder="Ex: Anatomia Humana"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Semestre</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full rounded-[var(--radius-btn)] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent"
          >
            <option value="">Sem semestre</option>
            {semesters.map((s) => (
              <option key={s} value={s}>{s}o Semestre</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Icone</label>
          <div className="flex flex-wrap gap-2">
            {emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-xl p-1.5 rounded-lg transition-colors ${
                  emoji === e ? 'bg-mint-100 ring-2 ring-mint-400' : 'hover:bg-gray-100'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Cor</label>
          <div className="flex gap-2">
            {colors.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full ${c.class} transition-all ${
                  color === c.value ? 'ring-2 ring-offset-2 ring-mint-400 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-pink-500">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={loading} className="flex-1">
            {editData ? 'Salvar' : 'Criar Materia'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
