import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { PATHS } from '@/constants/paths'
import { Role } from '@/constants/types'
import { getAccessToken } from '@/lib/http'

export const PublicRoute = () => {
  const { isAuthenticated, user } = useAuth()
  const hasToken = !!getAccessToken()

  if (hasToken && !isAuthenticated) {
    return <div>Loading...</div>
  }

  if (isAuthenticated && user) {
    if (user.role === Role.STUDENT) {
      return <Navigate to={PATHS.HOME} replace />
    }
    return <Navigate to={PATHS.LECTURER.DASHBOARD} replace />
  }

  return <Outlet />
}
