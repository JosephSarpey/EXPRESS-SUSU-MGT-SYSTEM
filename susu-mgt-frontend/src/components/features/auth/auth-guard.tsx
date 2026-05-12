import { useEffect } from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { authService } from '@/services/api/auth.service'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children?: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, setAuth } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      authService.getMe()
        .then(user => {
          if (user) setAuth(user)
        })
        .catch(console.error)
    }
  }, [isAuthenticated, setAuth])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
