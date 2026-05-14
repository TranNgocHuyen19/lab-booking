import { MemberRole, type MemberRoleType } from '@/constants/types'

export const hasGroupRole = (memberRole: string | null | undefined, role: MemberRoleType): boolean => {
  if (!memberRole) return false
  return memberRole === role
}

export const hasAnyGroupRole = (memberRole: string | null | undefined, roles: MemberRoleType[]): boolean => {
  if (!memberRole) return false
  return roles.includes(memberRole as MemberRoleType)
}

export const isGroupManager = (memberRole: string | null | undefined): boolean => {
  return hasAnyGroupRole(memberRole, [MemberRole.LEADER, MemberRole.CO_LEADER])
}

export const isGroupMember = (memberRole: string | null | undefined): boolean => {
  return !!memberRole
}
