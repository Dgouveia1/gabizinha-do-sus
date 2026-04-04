import { useEffect } from 'react'
import MembersList from './MembersList'
import CopyInviteLinkButton from './CopyInviteLinkButton'
import InviteByEmailForm from './InviteByEmailForm'
import { useBoardStore } from '@/stores/boardStore'

export default function CollaborationPanel({ open, onClose, boardId }) {
  const { currentMemberRole } = useBoardStore()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white h-full overflow-y-auto shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">👥 Membros</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <MembersList boardId={boardId} />

          {currentMemberRole === 'admin' && (
            <>
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-gray-700">Convidar membros</h3>
                <CopyInviteLinkButton boardId={boardId} />
                <div className="relative flex items-center">
                  <div className="flex-1 border-t border-gray-100" />
                  <span className="px-2 text-xs text-gray-400">ou</span>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
                <InviteByEmailForm boardId={boardId} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
