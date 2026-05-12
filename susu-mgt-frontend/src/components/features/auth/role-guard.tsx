import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/utils/constants/routes.constants'

type Role = 'ADMIN' | 'CUSTOMER' | 'WORKER'

interface RoleGuardProps {
  children?: React.ReactNode
  roles: Role[]
}

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
