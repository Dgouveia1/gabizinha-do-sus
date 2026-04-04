import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-mint-50">
      <div className="text-6xl mb-4">🏥</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Parece que você se perdeu no hospital. Vamos voltar para o plantão?
      </p>
      <Link to="/dashboard">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  )
}
