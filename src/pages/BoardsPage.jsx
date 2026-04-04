import { useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import PageContainer from '@/components/layout/PageContainer'
import BoardsGrid from '@/components/boards/BoardsGrid'
import CreateBoardModal from '@/components/boards/CreateBoardModal'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useBoards } from '@/hooks/useBoards'
import { useUIStore } from '@/stores/uiStore'

export default function BoardsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { boards, loading, createBoard } = useBoards()
  const { showToast } = useUIStore()

  async function handleCreate(data) {
    const { error } = await createBoard(data)
    if (error) {
      showToast(error, 'error')
      return error
    }
    showToast('Projeto criado! Bora estudar! 🚀', 'success')
  }

  const addButton = (
    <Button size="sm" onClick={() => setModalOpen(true)} data-intro-step="add-board">
      + Novo
    </Button>
  )

  return (
    <>
      <TopBar title="Meus Projetos" actions={addButton} />
      <PageContainer>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Nenhum projeto ainda</h2>
            <p className="text-sm text-gray-400 mb-6">
              Crie seu primeiro projeto e organize seus estudos por semestre!
            </p>
            <Button onClick={() => setModalOpen(true)} data-intro-step="add-board">
              Criar primeiro projeto
            </Button>
          </div>
        ) : (
          <BoardsGrid boards={boards} />
        )}
      </PageContainer>

      <CreateBoardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
