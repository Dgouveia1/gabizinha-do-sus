/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'
import { useBoardStore } from '@/stores/boardStore'
import { useUIStore } from '@/stores/uiStore'

export default function MembersList({ boardId }) {
  const [members, setMembers] = useState([])
  const { user } = useAuthStore()
  const { currentMemberRole } = useBoardStore()
  const { showToast } = useUIStore()

  async function fetchMembers() {
    const { data, error } = await supabase
      .from('board_members')
      .select('role, users(id, name, email, avatar_url)')
      .eq('board_id', boardId)

    const { data: ownerData, error: ownerError } = await supabase
      .from('boards')
      .select('owner_id, users!boards_owner_id_fkey(id, name, email, avatar_url)')
      .eq('id', boardId)
      .single()

    if (error || ownerError) {
      showToast('Erro ao carregar membros.', 'error')
      return
    }

    const allMembers = []
    if (ownerData?.users) {
      allMembers.push({ role: 'admin', users: ownerData.users, isOwner: true })
    }
    ;(data || []).forEach((m) => {
      if (m.users?.id !== ownerData?.owner_id) {
        allMembers.push(m)
      }
    })
    setMembers(allMembers)
  }

  useEffect(() => {
    if (!boardId) return
    fetchMembers()
  }, [boardId])

  async function changeRole(userId, newRole) {
    const prev = members.find((m) => m.users?.id === userId)?.role
    setMembers((m) => m.map((x) => x.users?.id === userId ? { ...x, role: newRole } : x))
    const { error } = await supabase.from('board_members').update({ role: newRole }).eq('board_id', boardId).eq('user_id', userId)
    if (error) {
      setMembers((m) => m.map((x) => x.users?.id === userId ? { ...x, role: prev } : x))
      showToast('Erro ao alterar cargo.', 'error')
    }
  }

  async function removeMember(userId) {
    const removed = members.find((m) => m.users?.id === userId)
    setMembers((prev) => prev.filter((m) => m.users?.id !== userId))
    const { error } = await supabase.from('board_members').delete().eq('board_id', boardId).eq('user_id', userId)
    if (error) {
      if (removed) setMembers((prev) => [...prev, removed])
      showToast('Erro ao remover membro.', 'error')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {members.map((m) => (
        <div key={m.users?.id} className="flex items-center gap-3">
          <Avatar src={m.users?.avatar_url} name={m.users?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {m.users?.name}
              {m.users?.id === user?.id && ' (você)'}
            </p>
            <p className="text-xs text-gray-400 truncate">{m.users?.email}</p>
          </div>
          {m.isOwner ? (
            <span className="text-xs text-mint-600 font-medium bg-mint-50 px-2 py-1 rounded-full">Dono</span>
          ) : currentMemberRole === 'admin' && m.users?.id !== user?.id ? (
            <div className="flex items-center gap-1">
              <select
                value={m.role}
                onChange={(e) => changeRole(m.users.id, e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-mint-400"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => {
                  if (window.confirm(`Remover ${m.users?.name} do projeto?`)) removeMember(m.users.id)
                }}
                className="text-gray-300 hover:text-red-400 transition-colors text-xs px-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400 capitalize">{m.role}</span>
          )}
        </div>
      ))}
    </div>
  )
}
