import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export function useProfile() {
  const { user, setUser } = useAuthStore()

  async function updateName(name) {
    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setUser(data)
    return error?.message
  }

  async function uploadAvatar(file) {
    const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
    if (file.size > MAX_SIZE) return 'Imagem muito grande. O limite é 2 MB.'

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) return uploadError.message

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: urlWithCacheBust })
      .eq('id', user.id)
      .select()
      .single()

    if (!error) setUser(data)
    return error?.message
  }

  return { user, updateName, uploadAvatar }
}
