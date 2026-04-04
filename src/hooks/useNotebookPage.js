/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotebookStore } from '@/stores/notebookStore'
import { useAuthStore } from '@/stores/authStore'

export function useNotebookPage(pageId) {
  const { activePage, setActivePage, clearActivePage, pages, addPage, updatePage, removePage } =
    useNotebookStore()
  const { user } = useAuthStore()
  const [attachments, setAttachments] = useState([])
  const [drawings, setDrawings] = useState([])
  const [overlayStrokes, setOverlayStrokes] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchPage = useCallback(async () => {
    setLoading(true)
    const [pageRes, attRes, drawRes] = await Promise.all([
      supabase.from('notebook_pages').select('*').eq('id', pageId).single(),
      supabase.from('notebook_attachments').select('*').eq('page_id', pageId).order('created_at'),
      supabase.from('notebook_drawings').select('*').eq('page_id', pageId).order('created_at'),
    ])

    if (pageRes.data) {
      setActivePage(pageRes.data)
      setOverlayStrokes(pageRes.data.overlay_strokes || [])
    }
    if (attRes.data) setAttachments(attRes.data)
    if (drawRes.data) setDrawings(drawRes.data)
    setLoading(false)
  }, [pageId, setActivePage])

  useEffect(() => {
    if (!pageId) {
      clearActivePage()
      return
    }
    fetchPage()
  }, [pageId, clearActivePage, fetchPage])

  async function createPage(chapterId, title) {
    const chapterPages = pages[chapterId] || []
    const maxPos = chapterPages.reduce((m, p) => Math.max(m, p.position ?? 0), 0)
    const { data, error } = await supabase
      .from('notebook_pages')
      .insert({ chapter_id: chapterId, title: title || 'Sem titulo', position: maxPos + 1000 })
      .select()
      .single()

    if (error) return { error: error.message }
    addPage(chapterId, data)
    return { data }
  }

  async function updatePageTitle(title) {
    if (!activePage) return
    const prev = activePage.title
    setActivePage({ ...activePage, title })
    updatePage(activePage.chapter_id, activePage.id, { title })
    const { error } = await supabase
      .from('notebook_pages')
      .update({ title })
      .eq('id', activePage.id)
    if (error) {
      setActivePage({ ...activePage, title: prev })
      updatePage(activePage.chapter_id, activePage.id, { title: prev })
    }
    return error?.message
  }

  async function saveContent(content, plainText) {
    if (!pageId) return
    const { error } = await supabase
      .from('notebook_pages')
      .update({ content, plain_text: plainText })
      .eq('id', pageId)
    return error?.message
  }

  async function deletePage(chapterId, targetPageId) {
    const pid = targetPageId || pageId
    const cid = chapterId || activePage?.chapter_id
    if (!pid || !cid) return
    const prev = (pages[cid] || []).find((p) => p.id === pid)
    removePage(cid, pid)
    const { error } = await supabase.from('notebook_pages').delete().eq('id', pid)
    if (error && prev) addPage(cid, prev)
    return error?.message
  }

  async function toggleFavorite() {
    if (!activePage) return
    const newVal = !activePage.is_favorite
    setActivePage({ ...activePage, is_favorite: newVal })
    updatePage(activePage.chapter_id, activePage.id, { is_favorite: newVal })
    const { error } = await supabase
      .from('notebook_pages')
      .update({ is_favorite: newVal })
      .eq('id', activePage.id)
    if (error) {
      setActivePage({ ...activePage, is_favorite: !newVal })
      updatePage(activePage.chapter_id, activePage.id, { is_favorite: !newVal })
    }
  }

  // File uploads
  async function uploadAttachment(file) {
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) return { error: 'Arquivo muito grande. O limite é 10 MB.' }

    const path = `${user.id}/${pageId}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('notebook-attachments')
      .upload(path, file)
    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('notebook-attachments')
      .getPublicUrl(path)

    const { data, error } = await supabase
      .from('notebook_attachments')
      .insert({
        page_id: pageId,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single()

    if (!error) setAttachments((prev) => [...prev, data])
    return error ? { error: error.message } : { url: publicUrl }
  }

  async function removeAttachment(attachmentId, fileUrl) {
    const removed = attachments.find((a) => a.id === attachmentId)
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
    const { error } = await supabase.from('notebook_attachments').delete().eq('id', attachmentId)
    if (error && removed) {
      setAttachments((prev) => [...prev, removed])
      return error.message
    }
    try {
      const url = new URL(fileUrl)
      const marker = '/object/public/notebook-attachments/'
      const idx = url.pathname.indexOf(marker)
      if (idx !== -1) {
        const storagePath = decodeURIComponent(url.pathname.slice(idx + marker.length))
        await supabase.storage.from('notebook-attachments').remove([storagePath])
      }
    } catch { /* storage orphan acceptable */ }
  }

  // Overlay strokes (annotation layer over editor)
  async function saveOverlayStrokes(newStrokes) {
    if (!pageId) return
    setOverlayStrokes(newStrokes)
    const { error } = await supabase
      .from('notebook_pages')
      .update({ overlay_strokes: newStrokes })
      .eq('id', pageId)
    return error?.message
  }

  // Drawings
  async function createDrawing(title) {
    const { data, error } = await supabase
      .from('notebook_drawings')
      .insert({ page_id: pageId, title: title || 'Desenho' })
      .select()
      .single()
    if (!error) setDrawings((prev) => [...prev, data])
    return error ? { error: error.message } : { data }
  }

  async function saveDrawing(drawingId, tldrawData) {
    const { error } = await supabase
      .from('notebook_drawings')
      .update({ tldraw_data: tldrawData, updated_at: new Date().toISOString() })
      .eq('id', drawingId)
    if (!error) {
      setDrawings((prev) =>
        prev.map((d) => (d.id === drawingId ? { ...d, tldraw_data: tldrawData } : d))
      )
    }
    return error?.message
  }

  async function deleteDrawing(drawingId) {
    const removed = drawings.find((d) => d.id === drawingId)
    setDrawings((prev) => prev.filter((d) => d.id !== drawingId))
    const { error } = await supabase.from('notebook_drawings').delete().eq('id', drawingId)
    if (error && removed) setDrawings((prev) => [...prev, removed])
    return error?.message
  }

  return {
    page: activePage,
    attachments,
    drawings,
    overlayStrokes,
    loading,
    createPage,
    updatePageTitle,
    saveContent,
    deletePage,
    toggleFavorite,
    uploadAttachment,
    removeAttachment,
    createDrawing,
    saveDrawing,
    deleteDrawing,
    saveOverlayStrokes,
    refetch: fetchPage,
  }
}
