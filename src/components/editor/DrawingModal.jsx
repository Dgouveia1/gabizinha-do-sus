import { Suspense, lazy, useState, useCallback } from 'react'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'

const Tldraw = lazy(() =>
  import('tldraw').then((mod) => ({ default: mod.Tldraw }))
)

export default function DrawingModal({ open, onClose, drawing, onSave }) {
  const [editorInstance, setEditorInstance] = useState(null)

  const handleMount = useCallback((editor) => {
    setEditorInstance(editor)
    // Load existing data if available
    if (drawing?.tldraw_data && Object.keys(drawing.tldraw_data).length > 0) {
      try {
        editor.store.loadSnapshot(drawing.tldraw_data)
      } catch {
        // Fresh drawing if data is invalid
      }
    }
  }, [drawing])

  const handleSave = useCallback(async () => {
    if (!editorInstance || !drawing) return
    const snapshot = editorInstance.store.getSnapshot()
    await onSave(drawing.id, snapshot)
    onClose()
  }, [editorInstance, drawing, onSave, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-gray-700">
            {drawing?.title || 'Desenho'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSave}>Salvar</Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <Spinner />
              <span className="ml-2 text-sm text-gray-500">Carregando editor de desenho...</span>
            </div>
          }
        >
          <Tldraw onMount={handleMount} />
        </Suspense>
      </div>
    </div>
  )
}
