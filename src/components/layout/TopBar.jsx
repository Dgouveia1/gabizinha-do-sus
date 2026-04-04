import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Avatar from '@/components/ui/Avatar'

export default function TopBar({ title, backTo, actions }) {
  const { user } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="flex items-center gap-3 px-4 h-14 max-w-screen-xl mx-auto">
        {backTo ? (
          <Link
            to={backTo}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Voltar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : (
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo-gabizinha-do-sus.png"
              alt="Gabizinha do SUS"
              className="h-8 w-8 object-contain rounded-lg"
            />
            <span className="font-semibold text-gray-800 text-sm hidden sm:block">Gabizinha do SUS</span>
          </Link>
        )}

        {title && (
          <h1 className="font-semibold text-gray-800 text-sm truncate flex-1 ml-1">{title}</h1>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {actions}
          <Link to="/profile">
            <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  )
}
