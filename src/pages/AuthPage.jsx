import { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton'
import { cn } from '@/utils/cn'

export default function AuthPage() {
  const [tab, setTab] = useState('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-sky-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / Hero */}
        <div className="text-center mb-8">
          <img
            src="/logo-gabizinha-do-sus.png"
            alt="Gabizinha do SUS"
            className="h-24 w-24 object-contain mx-auto mb-3 drop-shadow-md"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Gabizinha do SUS</h1>
          <p className="text-sm text-gray-500">Seu QG de estudos de medicina</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
                  tab === t
                    ? 'bg-white text-mint-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {tab === 'login' ? <LoginForm /> : <RegisterForm />}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">ou</div>
          </div>

          <GoogleOAuthButton />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Bora salvar vidas, doutora! 💚
        </p>
      </div>
    </div>
  )
}
