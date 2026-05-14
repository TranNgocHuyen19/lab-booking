import { useAuthContext } from '@/contexts/AuthContext'
import { hasRole, hasAnyRole } from '@/utils/rbac'
import type { RoleType } from '@/constants/types'

export const useAuth = () => {
  const auth = useAuthContext()

  return {
    ...auth,
    hasRole: (role: RoleType) => hasRole(auth.user, role),
    hasAnyRole: (roles: RoleType[]) => hasAnyRole(auth.user, roles)
  }
}
