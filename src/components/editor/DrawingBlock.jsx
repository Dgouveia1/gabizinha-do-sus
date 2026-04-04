export default function DrawingBlock({ drawing, onOpen, onDelete }) {
  return (
    <div className="notebook-drawing-block my-3" onClick={() => onOpen?.(drawing)}>
      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
      <span className="text-sm font-medium text-gray-600">{drawing?.title || 'Desenho'}</span>
      <span className="text-xs text-gray-400">Clique para abrir</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(drawing.id)
          }}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-pink-100 text-gray-400 hover:text-pink-500 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
