import { useRef, useState } from 'react'

export default function CardAttachments({ attachments, onUpload, onRemove }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    await onUpload(file)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        📎 Anexos
        <span className="text-xs font-normal text-gray-400">{attachments.length}</span>
      </h4>

      <div className="flex flex-col gap-2 mb-3">
        {attachments.map((att) => (
          <div key={att.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <span className="text-base">
              {att.file_name.endsWith('.pdf') ? '📄' : att.file_name.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? '🖼️' : '📁'}
            </span>
            <a
              href={att.file_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-sky-600 hover:underline flex-1 truncate"
            >
              {att.file_name}
            </a>
            <button
              onClick={() => {
                if (window.confirm(`Remover "${att.file_name}"?`)) onRemove(att.id, att.file_url)
              }}
              className="text-gray-300 hover:text-red-400 text-xs transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFile}
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.ppt,.pptx"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-sm text-gray-400 hover:text-mint-600 transition-colors disabled:opacity-50"
      >
        {uploading ? '⏳ Enviando...' : '+ Anexar arquivo'}
      </button>
    </div>
  )
}
