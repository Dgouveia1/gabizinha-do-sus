import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function useInvite() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function acceptInvite(token) {
    setLoading(true)
    setError(null)

    const { data: invite, error: inviteErr } = await supabase
      .from('board_invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteErr || !invite) {
      setError('Convite inválido ou expirado.')
      setLoading(false)
      return { error: 'Convite inválido ou expirado.' }
    }

    if (new Date(invite.expires_at) < new Date()) {
      setError('Este convite expirou.')
      setLoading(false)
      return { error: 'Este convite expirou.' }
    }

    // Upsert membership
    const { error: memberErr } = await supabase
      .from('board_members')
      .upsert({ board_id: invite.board_id, user_id: user.id, role: invite.role })

    if (memberErr) {
      setError('Erro ao entrar no projeto.')
      setLoading(false)
      return { error: memberErr.message }
    }

    setLoading(false)
    return { boardId: invite.board_id }
  }

  async function generateInviteLink(boardId, role = 'editor') {
    // Check for existing non-expired invite
    const { data: existing } = await supabase
      .from('board_invites')
      .select('token, expires_at')
      .eq('board_id', boardId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existing) return `${window.location.origin}/invite/${existing.token}`

    const { data, error } = await supabase
      .from('board_invites')
      .insert({ board_id: boardId, role, created_by: user.id })
      .select('token')
      .single()

    if (error) return null
    return `${window.location.origin}/invite/${data.token}`
  }

  async function inviteByEmail(boardId, email, role = 'editor') {
    // Look up user by email
    const { data: targetUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (!targetUser) return 'Usuário não encontrado. Peça para ele se cadastrar primeiro.'

    const { error } = await supabase
      .from('board_members')
      .upsert({ board_id: boardId, user_id: targetUser.id, role })

    return error?.message || null
  }

  return { loading, error, acceptInvite, generateInviteLink, inviteByEmail }
}
