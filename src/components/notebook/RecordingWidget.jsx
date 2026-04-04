import { useState, useRef } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { cn } from '@/utils/cn'

const statusLabel = {
  pending: { text: 'Transcrição pendente', color: 'text-gray-400' },
  processing: { text: 'Transcrevendo...', color: 'text-amber-500' },
  done: { text: 'Transcrição pronta', color: 'text-mint-600' },
  error: { text: 'Erro na transcrição', color: 'text-pink-500' },
}

function RecordingItem({ rec, onDelete, onTranscribe, formatDuration }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const status = statusLabel[rec.transcript_status] || statusLabel.pending

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const date = new Date(rec.created_at).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors group">
      {/* Play button */}
      <button
        onClick={togglePlay}
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors',
          playing ? 'bg-mint-100 text-mint-600' : 'bg-gray-100 text-gray-500 hover:bg-mint-50 hover:text-mint-600'
        )}
      >
        {playing ? (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <audio
        ref={audioRef}
        src={rec.file_url}
        onEnded={() => setPlaying(false)}
        className="hidden"
        preload="none"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">
            {formatDuration(rec.duration_seconds || 0)}
          </span>
          <span className="text-[10px] text-gray-400">{date}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn('text-[10px] font-medium', status.color)}>
            {status.text}
          </span>
          {rec.transcript_status === 'pending' && (
            <button
              onClick={() => onTranscribe(rec.id)}
              className="text-[10px] text-mint-600 hover:underline font-medium"
            >
              Transcrever
            </button>
          )}
          {rec.transcript_status === 'done' && rec.transcript && (
            <button
              className="text-[10px] text-mint-600 hover:underline font-medium"
              onClick={() => alert(rec.transcript)}
            >
              Ver texto
            </button>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(rec.id, rec.file_url)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-pink-100 text-gray-400 hover:text-pink-500 transition-all flex-shrink-0"
        title="Excluir gravação"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function RecordingWidget({ pageId }) {
  const [expanded, setExpanded] = useState(false)
  const {
    isRecording, duration, saving,
    recordings, loadingRecordings,
    startRecording, stopRecording,
    deleteRecording, requestTranscription, formatDuration,
  } = useAudioRecorder(pageId)

  async function handleToggleRecording() {
    if (isRecording) {
      await stopRecording()
      setExpanded(true) // show list after stopping
    } else {
      await startRecording()
    }
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      {/* Trigger row */}
      <div className="flex items-center gap-3">
        {/* Record button */}
        <button
          onClick={handleToggleRecording}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95',
            isRecording
              ? 'bg-pink-500 text-white shadow-md hover:bg-pink-600'
              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
          )}
        >
          {/* Pulsing dot when recording */}
          <span className={cn(
            'w-2.5 h-2.5 rounded-full flex-shrink-0',
            isRecording ? 'bg-white animate-pulse' : 'bg-red-400'
          )} />
          {saving ? 'Salvando...' : isRecording ? `Parar ${formatDuration(duration)}` : 'Gravar aula'}
        </button>

        {/* Toggle list */}
        {recordings.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {recordings.length} gravação{recordings.length !== 1 ? 'ões' : ''}
            <svg
              className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Recordings list */}
      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {loadingRecordings ? (
            <div className="text-xs text-gray-400 py-2 text-center">Carregando...</div>
          ) : recordings.length === 0 ? (
            <div className="text-xs text-gray-400 py-2 text-center">Nenhuma gravação ainda</div>
          ) : (
            recordings.map((rec) => (
              <RecordingItem
                key={rec.id}
                rec={rec}
                onDelete={deleteRecording}
                onTranscribe={requestTranscription}
                formatDuration={formatDuration}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
