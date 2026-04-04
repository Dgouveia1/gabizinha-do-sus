import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function CreateChapterModal({ open, onClose, onCreate, editData }) {
  const [title, setTitle] = useState(editData?.title || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return setError('Digite o nome do capitulo.')
    setLoading(true)
    setError('')
    const result = await onCreate(title.trim())
    if (result?.error) setError(result.error)
    else {
      setTitle('')
      onClose()
    }
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title={editData ? 'Editar Capitulo' : 'Novo Capitulo'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome do capitulo *"
          placeholder="Ex: Sistema Nervoso Central"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        {error && <p className="text-sm text-pink-500">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" loading={loading} className="flex-1">
            {editData ? 'Salvar' : 'Criar Capitulo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
