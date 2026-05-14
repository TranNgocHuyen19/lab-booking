import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { PATHS } from '@/constants/paths'
import { type RoleType } from '@/constants/types'
import { getDashboardPath } from '@/utils/rbac'

interface PrivateRouteProps {
  allowedRole: RoleType
  redirectPath?: string
}

export const PrivateRoute = ({ allowedRole, redirectPath }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={redirectPath || PATHS.STUDENT.LOGIN} replace />
  }

  if (user?.role !== allowedRole) {
    return <Navigate to={getDashboardPath(user?.role as RoleType)} replace />
  }

  return <Outlet />
}
