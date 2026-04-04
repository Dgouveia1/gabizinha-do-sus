import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

/**
 * Records audio from the microphone, uploads to Supabase Storage,
 * and saves metadata to notebook_recordings.
 *
 * The transcription via OpenAI Whisper is a stub — ready to wire up
 * when the Edge Function `transcribe-recording` is activated.
 */
export function useAudioRecorder(pageId) {
  const { user } = useAuthStore()
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [saving, setSaving] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [loadingRecordings, setLoadingRecordings] = useState(false)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  // Fetch existing recordings for this page
  const fetchRecordings = useCallback(async () => {
    if (!pageId) return
    setLoadingRecordings(true)
    const { data } = await supabase
      .from('notebook_recordings')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: false })
    setRecordings(data || [])
    setLoadingRecordings(false)
  }, [pageId])

  useEffect(() => {
    fetchRecordings()
  }, [fetchRecordings])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Seu navegador não suporta gravação de áudio.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/ogg;codecs=opus'

      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start(1000) // collect data every 1s
      mediaRecorderRef.current = recorder
      startTimeRef.current = Date.now()
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch (err) {
      alert(`Não foi possível acessar o microfone: ${err.message}`)
    }
  }

  async function stopRecording() {
    if (!mediaRecorderRef.current) return
    clearInterval(timerRef.current)

    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType })
        const durationSecs = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setIsRecording(false)
        setSaving(true)

        const result = await uploadRecording(blob, durationSecs)
        setSaving(false)
        resolve(result)
      }
      mediaRecorderRef.current.stop()
    })
  }

  async function uploadRecording(blob, durationSecs) {
    if (!user || !pageId) return { error: 'Sem usuário ou página' }

    const ext = blob.type.includes('webm') ? 'webm' : 'ogg'
    const fileName = `rec_${Date.now()}.${ext}`
    const storagePath = `${user.id}/${pageId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('notebook-recordings')
      .upload(storagePath, blob, { contentType: blob.type })

    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('notebook-recordings')
      .getPublicUrl(storagePath)

    const { data, error } = await supabase
      .from('notebook_recordings')
      .insert({
        page_id: pageId,
        user_id: user.id,
        file_url: publicUrl,
        file_name: fileName,
        duration_seconds: durationSecs,
        transcript_status: 'pending',
      })
      .select()
      .single()

    if (!error && data) {
      setRecordings((prev) => [data, ...prev])
    }

    return error ? { error: error.message } : { data }
  }

  async function deleteRecording(recordingId, fileUrl) {
    const removed = recordings.find((r) => r.id === recordingId)
    setRecordings((prev) => prev.filter((r) => r.id !== recordingId))
    await supabase.from('notebook_recordings').delete().eq('id', recordingId)

    // Remove from storage
    try {
      const marker = '/object/public/notebook-recordings/'
      const url = new URL(fileUrl)
      const idx = url.pathname.indexOf(marker)
      if (idx !== -1) {
        const path = decodeURIComponent(url.pathname.slice(idx + marker.length))
        await supabase.storage.from('notebook-recordings').remove([path])
      }
    } catch {
      // Storage orphan acceptable
      if (removed) setRecordings((prev) => [removed, ...prev])
    }
  }

  /**
   * Stub: will call Edge Function transcribe-recording when activated.
   * Update transcript_status to 'processing' immediately for UX feedback.
   */
  async function requestTranscription(recordingId) {
    await supabase
      .from('notebook_recordings')
      .update({ transcript_status: 'processing' })
      .eq('id', recordingId)

    setRecordings((prev) =>
      prev.map((r) => r.id === recordingId ? { ...r, transcript_status: 'processing' } : r)
    )

    // TODO: call Edge Function when ready:
    // const { data, error } = await supabase.functions.invoke('transcribe-recording', {
    //   body: { recordingId }
    // })
  }

  function formatDuration(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return {
    isRecording,
    duration,
    saving,
    recordings,
    loadingRecordings,
    startRecording,
    stopRecording,
    deleteRecording,
    requestTranscription,
    formatDuration,
    refetch: fetchRecordings,
  }
}
