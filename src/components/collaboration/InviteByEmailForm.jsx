import { useState } from 'react'
import { useInvite } from '@/hooks/useInvite'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function InviteByEmailForm({ boardId }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { inviteByEmail } = useInvite()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setMessage('')
    const err = await inviteByEmail(boardId, email.trim())
    if (err) setMessage(err)
    else {
      setMessage(`✓ ${email} adicionado ao projeto!`)
      setEmail('')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Input
        type="email"
        placeholder="email@colega.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {message && (
        <p className={`text-xs ${message.startsWith('✓') ? 'text-mint-600' : 'text-pink-500'}`}>
          {message}
        </p>
      )}
      <Button type="submit" loading={loading} size="sm" variant="secondary" className="w-full">
        Convidar por e-mail
      </Button>
    </form>
  )
}
