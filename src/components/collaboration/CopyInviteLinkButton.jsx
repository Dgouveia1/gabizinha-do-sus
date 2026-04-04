import { useState } from 'react'
import { useInvite } from '@/hooks/useInvite'
import Button from '@/components/ui/Button'

export default function CopyInviteLinkButton({ boardId }) {
  const { generateInviteLink } = useInvite()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCopy() {
    setLoading(true)
    const link = await generateInviteLink(boardId)
    if (link) {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      loading={loading}
      className="w-full"
    >
      {copied ? '✓ Link copiado!' : '🔗 Copiar link de convite'}
    </Button>
  )
}
