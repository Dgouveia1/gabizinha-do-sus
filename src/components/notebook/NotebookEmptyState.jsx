import Button from '@/components/ui/Button'

export default function NotebookEmptyState({ onCreateSubject }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="text-6xl mb-4">📓</div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Seu caderno esta vazio
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        Comece criando uma materia para organizar seus estudos por semestre, capitulo e pagina.
      </p>
      <Button onClick={onCreateSubject}>
        + Nova Materia
      </Button>
    </div>
  )
}
