import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useInvite } from '@/hooks/useInvite'
import { useAuthInit } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function InvitePage() {
  useAuthInit()
  const { token } = useParams()
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuthStore()
  const { acceptInvite, loading, error } = useInvite()
  const [done, setDone] = useState(false)
  const [boardId, setBoardId] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!session) {
      // Store the invite token and redirect to auth
      sessionStorage.setItem('pendingInviteToken', token)
      navigate(`/auth`, { replace: true })
      return
    }

    async function handleAccept() {
      const result = await acceptInvite(token)
      if (!result.error) {
        setBoardId(result.boardId)
        setDone(true)
      }
    }

    // Auto-accept if user is already logged in
    handleAccept()
  }, [authLoading, session, acceptInvite, navigate, token])

  // Also handle case where user just logged in with a pending invite
  useEffect(() => {
    if (!session || authLoading) return
    const pending = sessionStorage.getItem('pendingInviteToken')
    if (pending === token) {
      sessionStorage.removeItem('pendingInviteToken')
    }
  }, [session, authLoading, token])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mint-50">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400 mt-4">Processando convite...</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mint-50 px-4 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Bem-vinda ao projeto!</h1>
        <p className="text-sm text-gray-400 mb-6">Você foi adicionada com sucesso. Hora de colaborar!</p>
        <Button onClick={() => navigate(`/boards/${boardId}`)}>
          Abrir projeto
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mint-50 px-4 text-center">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Convite inválido</h1>
        <p className="text-sm text-gray-400 mb-6">{error}</p>
        <Link to="/boards">
          <Button variant="outline">Ir para meus projetos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mint-50">
      <Spinner size="lg" />
    </div>
  )
}
