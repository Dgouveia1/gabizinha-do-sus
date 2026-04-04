import { Suspense, lazy, useState, useCallback } from 'react'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const Tldraw = lazy(() =>
  import('tldraw').then((mod) => ({ default: mod.Tldraw }))
)

const PEN_COLORS = [
  { label: 'Preto', value: '#1a1a2e' },
  { label: 'Azul', value: '#1d4ed8' },
  { label: 'Vermelho', value: '#dc2626' },
  { label: 'Verde', value: '#16a34a' },
  { label: 'Laranja', value: '#ea580c' },
  { label: 'Roxo claro', value: '#7c3aed' },
]

export default function DrawingModal({ open, onClose, drawing, onSave }) {
  const [editorInstance, setEditorInstance] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activePenColor, setActivePenColor] = useState(PEN_COLORS[0].value)

  const handleMount = useCallback((editor) => {
    setEditorInstance(editor)

    // Load existing data
    if (drawing?.tldraw_data && Object.keys(drawing.tldraw_data).length > 0) {
      try {
        editor.store.loadSnapshot(drawing.tldraw_data)
      } catch {
        // Fresh drawing if data is invalid
      }
    }

    // Set draw tool as default (simulates pen/stylus writing)
    editor.setCurrentTool('draw')

    // Configure initial pen style for naturalness
    editor.setStyleForNextShapes(editor.styleProps?.color ?? {}, { color: 'black', size: 's' })
  }, [drawing])

  // Change pen color via tldraw's style system
  const handleColorChange = useCallback((color) => {
    setActivePenColor(color)
    if (!editorInstance) return
    // Map hex → tldraw color names for built-in colors
    const colorMap = {
      '#1a1a2e': 'black',
      '#1d4ed8': 'blue',
      '#dc2626': 'red',
      '#16a34a': 'green',
      '#ea580c': 'orange',
      '#7c3aed': 'violet',
    }
    const tlColor = colorMap[color] || 'black'
    editorInstance.run(() => {
      editorInstance.setStyleForNextShapes({ color: tlColor })
    })
  }, [editorInstance])

  const handleSave = useCallback(async () => {
    if (!editorInstance || !drawing) return
    setSaving(true)
    const snapshot = editorInstance.store.getSnapshot()
    await onSave(drawing.id, snapshot)
    setSaving(false)
    onClose()
  }, [editorInstance, drawing, onSave, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] bg-white flex flex-col"
      style={{ height: '100dvh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white flex-shrink-0 safe-top">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Voltar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-gray-700 truncate max-w-[140px]">
            {drawing?.title || 'Desenho'}
          </h2>
        </div>

        {/* Quick pen color palette */}
        <div className="flex items-center gap-1.5 mx-2 flex-1 justify-center">
          {PEN_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => handleColorChange(c.value)}
              title={c.label}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 active:scale-95',
                activePenColor === c.value ? 'border-gray-700 scale-110' : 'border-gray-200'
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose} className="hidden sm:flex">
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Spinner size="xs" />
                Salvando
              </span>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </div>

      {/* Canvas — touch-action: none prevents scroll interference with stylus */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Spinner />
              <span className="text-sm text-gray-500">Carregando editor de desenho...</span>
            </div>
          }
        >
          <Tldraw
            onMount={handleMount}
            // Hide the default tldraw UI chrome — we use our own header
            hideUi={false}
          />
        </Suspense>
      </div>

      {/* Pen tip indicator for stylus users */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs pointer-events-none opacity-0 animate-fade-out"
        id="pen-mode-hint"
      >
        ✏️ Modo caneta ativo
      </div>
    </div>
  )
}
