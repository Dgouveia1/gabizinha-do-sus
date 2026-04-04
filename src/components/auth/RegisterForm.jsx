import { useState } from 'react'
import { signUpWithEmail } from '@/hooks/useAuth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    const err = await signUpWithEmail(email, password, name)
    if (err) {
      setError(err.message || 'Erro ao cadastrar.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">📬</div>
        <h3 className="font-semibold text-gray-800 mb-1">Quase lá, doutora!</h3>
        <p className="text-sm text-gray-500">
          Verifique seu e-mail para confirmar o cadastro e acessar a plataforma.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Seu nome"
        type="text"
        placeholder="Dra. Gabriela"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
      />
      <Input
        label="E-mail"
        type="email"
        placeholder="sua@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Senha"
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
      />
      {error && <p className="text-sm text-pink-500">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        Criar conta
      </Button>
    </form>
  )
}
