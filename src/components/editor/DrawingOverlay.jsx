import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/utils/cn'

const PEN_COLORS = [
  { label: 'Preto', value: '#1a1a2e' },
  { label: 'Azul', value: '#1d4ed8' },
  { label: 'Vermelho', value: '#dc2626' },
  { label: 'Verde', value: '#16a34a' },
  { label: 'Laranja', value: '#ea580c' },
  { label: 'Roxo', value: '#7c3aed' },
]

const PEN_SIZES = [
  { label: 'Fina', value: 2 },
  { label: 'Media', value: 4 },
  { label: 'Grossa', value: 7 },
]

/**
 * Transparent drawing overlay that sits on top of the editor content.
 * When active, captures pointer events for freehand drawing.
 * When inactive, pointer-events: none lets everything pass through.
 */
export default function DrawingOverlay({ active, strokes, onStrokesChange }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState(null)
  const [penColor, setPenColor] = useState(PEN_COLORS[0].value)
  const [penSize, setPenSize] = useState(PEN_SIZES[1].value)
  const [eraserMode, setEraserMode] = useState(false)

  // Resize canvas to match container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    redrawAll(ctx, strokes, rect.width, rect.height)
  }, [strokes])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  // Redraw whenever strokes change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    redrawAll(ctx, strokes, w, h)
  }, [strokes])

  function redrawAll(ctx, strokeList, w, h) {
    ctx.clearRect(0, 0, w, h)
    if (!strokeList?.length) return

    for (const stroke of strokeList) {
      drawStroke(ctx, stroke)
    }
  }

  function drawStroke(ctx, stroke) {
    if (!stroke.points || stroke.points.length < 2) return

    ctx.beginPath()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalCompositeOperation = 'source-over'

    const [first, ...rest] = stroke.points
    ctx.moveTo(first.x, first.y)

    for (const pt of rest) {
      ctx.lineTo(pt.x, pt.y)
    }

    ctx.stroke()
  }

  function getPointerPos(e) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  // Eraser: find and remove stroke near the pointer
  function eraseAt(pos) {
    if (!strokes?.length) return
    const threshold = 12

    const remaining = strokes.filter((stroke) => {
      return !stroke.points.some((pt) => {
        const dx = pt.x - pos.x
        const dy = pt.y - pos.y
        return Math.sqrt(dx * dx + dy * dy) < threshold + stroke.size / 2
      })
    })

    if (remaining.length !== strokes.length) {
      onStrokesChange(remaining)
    }
  }

  function handlePointerDown(e) {
    if (!active) return
    e.preventDefault()

    if (eraserMode) {
      setIsDrawing(true)
      eraseAt(getPointerPos(e))
      return
    }

    const pos = getPointerPos(e)
    const newStroke = {
      color: penColor,
      size: penSize,
      points: [pos],
    }
    setCurrentStroke(newStroke)
    setIsDrawing(true)
  }

  function handlePointerMove(e) {
    if (!isDrawing || !active) return
    e.preventDefault()

    const pos = getPointerPos(e)

    if (eraserMode) {
      eraseAt(pos)
      return
    }

    if (!currentStroke) return

    const updated = {
      ...currentStroke,
      points: [...currentStroke.points, pos],
    }
    setCurrentStroke(updated)

    // Draw the current stroke in real-time
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr

    redrawAll(ctx, strokes, w, h)
    drawStroke(ctx, updated)
  }

  function handlePointerUp() {
    if (!isDrawing) return
    setIsDrawing(false)

    if (eraserMode || !currentStroke) {
      setCurrentStroke(null)
      return
    }

    // Only save strokes with at least 2 points
    if (currentStroke.points.length >= 2) {
      const newStrokes = [...(strokes || []), currentStroke]
      onStrokesChange(newStrokes)
    }
    setCurrentStroke(null)
  }

  function handleUndo() {
    if (!strokes?.length) return
    onStrokesChange(strokes.slice(0, -1))
  }

  function handleClear() {
    onStrokesChange([])
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ pointerEvents: active ? 'auto' : 'none', zIndex: active ? 20 : 5 }}
    >
      {/* Canvas — always visible to show strokes, but only interactive when active */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          touchAction: 'none',
          cursor: active ? (eraserMode ? 'crosshair' : 'crosshair') : 'default',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Floating toolbar — only visible when active */}
      {active && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 z-30">
          {/* Colors */}
          {PEN_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => { setPenColor(c.value); setEraserMode(false) }}
              title={c.label}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 flex-shrink-0',
                !eraserMode && penColor === c.value ? 'border-gray-700 scale-110' : 'border-gray-200'
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Pen sizes */}
          {PEN_SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => { setPenSize(s.value); setEraserMode(false) }}
              title={s.label}
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-lg transition-colors',
                !eraserMode && penSize === s.value ? 'bg-mint-100 text-mint-700' : 'text-gray-400 hover:bg-gray-100'
              )}
            >
              <span
                className="rounded-full bg-current"
                style={{ width: s.value + 2, height: s.value + 2 }}
              />
            </button>
          ))}

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Eraser */}
          <button
            onClick={() => setEraserMode(!eraserMode)}
            title="Borracha"
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              eraserMode ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:bg-gray-100'
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          </button>

          {/* Undo */}
          <button
            onClick={handleUndo}
            title="Desfazer"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            disabled={!strokes?.length}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>

          {/* Clear all */}
          <button
            onClick={handleClear}
            title="Limpar tudo"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            disabled={!strokes?.length}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
