import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '@/components/layout/TopBar'
import PageContainer from '@/components/layout/PageContainer'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useProfile } from '@/hooks/useProfile'
import { signOut } from '@/hooks/useAuth'
import { useUIStore } from '@/stores/uiStore'

export default function ProfilePage() {
  const { user, updateName, uploadAvatar } = useProfile()
  const { showToast } = useUIStore()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleSaveName(e) {
    e.preventDefault()
    setSaving(true)
    const err = await updateName(name)
    if (err) showToast(err, 'error')
    else showToast('Nome atualizado!', 'success')
    setSaving(false)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const err = await uploadAvatar(file)
    if (err) showToast(err, 'error')
    else showToast('Foto atualizada!', 'success')
    setUploading(false)
    e.target.value = ''
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  return (
    <>
      <TopBar title="Meu Perfil" />
      <PageContainer>
        <div className="max-w-sm mx-auto flex flex-col gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <Avatar src={user?.avatar_url} name={user?.name} size="xl" />
              {uploading && (
                <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-mint-300 border-t-mint-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
            <label className="cursor-pointer text-sm text-mint-600 hover:text-mint-700 font-medium transition-colors">
              Alterar foto
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>

          {/* Name */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <form onSubmit={handleSaveName} className="flex flex-col gap-4">
              <Input
                label="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dra. Gabriela"
              />
              <Input
                label="E-mail"
                value={user?.email || ''}
                disabled
                className="opacity-60"
              />
              <Button type="submit" loading={saving} className="w-full">
                Salvar alterações
              </Button>
            </form>
          </div>

          {/* Sign out */}
          <Button variant="outline" onClick={handleSignOut} className="w-full text-gray-500">
            Sair da conta
          </Button>
        </div>
      </PageContainer>
    </>
  )
}
