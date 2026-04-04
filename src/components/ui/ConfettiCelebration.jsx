import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function ConfettiCelebration({ trigger }) {
  useEffect(() => {
    if (!trigger) return
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#bbf7d0', '#7dd3fc', '#f9a8d4', '#4ade80', '#f472b6'],
    })
  }, [trigger])

  return null
}
