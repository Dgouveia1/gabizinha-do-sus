/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, no-use-before-define, no-unused-vars */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useCard(cardId) {
  const [card, setCard] = useState(null)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [checklistItems, setChecklistItems] = useState([])
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [cardRes, commentsRes, attachRes, checkRes, linksRes] = await Promise.all([
      supabase.from('cards').select('*').eq('id', cardId).single(),
      supabase
        .from('comments')
        .select('*, users(name, avatar_url)')
        .eq('card_id', cardId)
        .order('created_at'),
      supabase.from('attachments').select('*').eq('card_id', cardId).order('created_at'),
      supabase
        .from('checklist_items')
        .select('*')
        .eq('card_id', cardId)
        .order('position'),
      supabase.from('card_links').select('*').eq('card_id', cardId),
    ])

    if (cardRes.data) setCard(cardRes.data)
    if (commentsRes.data) setComments(commentsRes.data)
    if (attachRes.data) setAttachments(attachRes.data)
    if (checkRes.data) setChecklistItems(checkRes.data)
    if (linksRes.data) setLinks(linksRes.data)
    setLoading(false)
  }, [cardId])

  useEffect(() => {
    if (!cardId) return
    fetchAll()
  }, [cardId, fetchAll])

  async function addComment(userId, content) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ card_id: cardId, user_id: userId, content })
      .select('*, users(name, avatar_url)')
      .single()
    if (!error) setComments((prev) => [...prev, data])
    return error?.message
  }

  async function addChecklistItem(text) {
    const maxPos = checklistItems.reduce((m, i) => Math.max(m, i.position ?? 0), 0)
    const { data, error } = await supabase
      .from('checklist_items')
      .insert({ card_id: cardId, text, position: maxPos + 1000 })
      .select()
      .single()
    if (!error) setChecklistItems((prev) => [...prev, data])
    return error?.message
  }

  async function toggleChecklistItem(itemId, isDone) {
    setChecklistItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, is_done: isDone } : i))
    )
    const { error } = await supabase.from('checklist_items').update({ is_done: isDone }).eq('id', itemId)
    if (error) {
      setChecklistItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, is_done: !isDone } : i))
      )
    }
    return error?.message
  }

  async function removeChecklistItem(itemId) {
    const removed = checklistItems.find((i) => i.id === itemId)
    setChecklistItems((prev) => prev.filter((i) => i.id !== itemId))
    const { error } = await supabase.from('checklist_items').delete().eq('id', itemId)
    if (error && removed) setChecklistItems((prev) => [...prev, removed])
    return error?.message
  }

  async function addLink(url, label) {
    const { data, error } = await supabase
      .from('card_links')
      .insert({ card_id: cardId, url, label })
      .select()
      .single()
    if (!error) setLinks((prev) => [...prev, data])
    return error?.message
  }

  async function removeLink(linkId) {
    const removed = links.find((l) => l.id === linkId)
    setLinks((prev) => prev.filter((l) => l.id !== linkId))
    const { error } = await supabase.from('card_links').delete().eq('id', linkId)
    if (error && removed) setLinks((prev) => [...prev, removed])
    return error?.message
  }

  async function uploadAttachment(file) {
    const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
    if (file.size > MAX_SIZE) return 'Arquivo muito grande. O limite é 10 MB.'

    const path = `cards/${cardId}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(path, file)
    if (uploadError) return uploadError.message

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(path)

    const { data, error } = await supabase
      .from('attachments')
      .insert({ card_id: cardId, file_url: publicUrl, file_name: file.name })
      .select()
      .single()

    if (!error) setAttachments((prev) => [...prev, data])
    return error?.message
  }

  async function removeAttachment(attachmentId, fileUrl) {
    const removed = attachments.find((a) => a.id === attachmentId)
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
    const { error } = await supabase.from('attachments').delete().eq('id', attachmentId)
    if (error && removed) {
      setAttachments((prev) => [...prev, removed])
      return error.message
    }
    // Extract storage path from URL
    try {
      const url = new URL(fileUrl)
      const marker = '/object/public/attachments/'
      const idx = url.pathname.indexOf(marker)
      if (idx !== -1) {
        const path = decodeURIComponent(url.pathname.slice(idx + marker.length))
        await supabase.storage.from('attachments').remove([path])
      }
    } catch { /* URL parse failed — DB record already deleted, storage orphan is acceptable */ }
  }

  return {
    card, comments, attachments, checklistItems, links, loading,
    refetch: fetchAll,
    addComment, addChecklistItem, toggleChecklistItem, removeChecklistItem,
    addLink, removeLink, uploadAttachment, removeAttachment,
  }
}
