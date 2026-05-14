import { useAuth } from '@/hooks/use-auth'
import type { RoleType } from '@/constants/types'
import { hasRole, hasAnyRole } from '@/utils/rbac'

export const useRole = () => {
  const { user } = useAuth()

  return {
    role: user?.role,
    hasRole: (role: RoleType) => hasRole(user, role),
    hasAnyRole: (roles: RoleType[]) => hasAnyRole(user, roles)
  }
}
