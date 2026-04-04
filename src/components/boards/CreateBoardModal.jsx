import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const semesters = Array.from({ length: 12 }, (_, i) => i + 1)

export default function CreateBoardModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [semester, setSemester] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return setError('Dê um nome ao projeto.')
    setLoading(true)
    setError('')
    const err = await onCreate({ title: title.trim(), description: description.trim(), semester: semester ? Number(semester) : null })
    if (err) setError(err)
    else {
      setTitle('')
      setDescription('')
      setSemester('')
      onClose()
    }
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo Projeto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome do projeto *"
          placeholder="Ex: Caso Clínico de Pediatria"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <Input
          label="Descrição (opcional)"
          placeholder="Ex: Preparação para o seminário"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
              <option key={s} value={s}>{s}º Semestre</option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-pink-500">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={loading} className="flex-1">Criar Projeto</Button>
        </div>
      </form>
    </Modal>
  )
}
