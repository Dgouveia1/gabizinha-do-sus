import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { useAuthInit } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import AppShell from '@/components/layout/AppShell'
import Spinner from '@/components/ui/Spinner'

// Pages
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import BoardsPage from '@/pages/BoardsPage'
import BoardPage from '@/pages/BoardPage'
import InvitePage from '@/pages/InvitePage'
import ProfilePage from '@/pages/ProfilePage'
import NotebookPage from '@/pages/NotebookPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Root layout: initializes auth ONCE, shared by all routes
function RootLayout() {
  useAuthInit()
  return <Outlet />
}

function ProtectedLayout() {
  const { session, loading } = useAuthStore()
  if (loading) return <Spinner fullscreen />
  if (!session) return <Navigate to="/auth" replace />
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function AuthRoute() {
  const { session, loading } = useAuthStore()
  if (loading) return <Spinner fullscreen />
  if (session) return <Navigate to="/dashboard" replace />
  return <AuthPage />
}

function RootRedirect() {
  const { session, loading } = useAuthStore()
  if (loading) return <Spinner fullscreen />
  return <Navigate to={session ? '/dashboard' : '/auth'} replace />
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <RootRedirect /> },
      { path: '/auth', element: <AuthRoute /> },
      { path: '/invite/:token', element: <InvitePage /> },
      {
        element: <ProtectedLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/boards', element: <BoardsPage /> },
          { path: '/boards/:boardId', element: <BoardPage /> },
          { path: '/notebook', element: <NotebookPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
