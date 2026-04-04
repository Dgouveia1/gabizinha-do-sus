import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'

export default function CardComments({ comments, onAdd }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    await onAdd(user.id, content.trim())
    setContent('')
    setLoading(false)
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">💬 Comentários</h4>

      <div className="flex flex-col gap-3 mb-4">
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">Nenhum comentário ainda. Seja o primeiro!</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <Avatar
              src={comment.users?.avatar_url}
              name={comment.users?.name}
              size="sm"
              className="flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-600 mb-0.5">{comment.users?.name}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">
                {new Date(comment.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Avatar src={user?.avatar_url} name={user?.name} size="sm" className="flex-shrink-0 mb-0.5" />
        <div className="flex-1 flex flex-col gap-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Adicione um comentário..."
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-mint-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          {content.trim() && (
            <button
              type="submit"
              disabled={loading}
              className="self-end text-sm bg-mint-500 text-white px-3 py-1 rounded-xl hover:bg-mint-600 transition-colors disabled:opacity-50"
            >
              Enviar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
