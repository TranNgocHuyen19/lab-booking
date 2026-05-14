import type { UserResponse } from '@/schemas/user.schema'
import { Role, type RoleType } from '@/constants/types'
import { PATHS } from '@/constants/paths'

export const hasRole = (user: UserResponse | null | undefined, role: RoleType): boolean => {
  if (!user || !user.role) return false
  return user.role === role
}

export const hasAnyRole = (user: UserResponse | null | undefined, roles: RoleType[]): boolean => {
  if (!user || !user.role) return false
  return roles.includes(user.role as RoleType)
}

export const getRoleDisplayName = (role: RoleType): string => {
  const roleNames: Record<RoleType, string> = {
    ADMIN: 'Quản trị viên',
    LAB_MANAGER: 'Quản lý phòng lab',
    LECTURER: 'Giảng viên',
    STUDENT: 'Sinh viên'
  }
  return roleNames[role] || role
}

export const getDashboardPath = (role: RoleType): string => {
  switch (role) {
    case Role.ADMIN:
      return PATHS.ADMIN.DASHBOARD
    case Role.LAB_MANAGER:
      return PATHS.LAB_MANAGER.DASHBOARD
    case Role.LECTURER:
      return PATHS.LECTURER.DASHBOARD
    case Role.STUDENT:
      return PATHS.HOME
    default:
      return PATHS.HOME
  }
}
