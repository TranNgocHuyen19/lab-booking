import { ParticipantRole, type ParticipantRoleType, MemberRole } from '@/constants/types'

const ROLE_ORDER: Record<string, number> = {
  [ParticipantRole.SUPERVISOR]: 1,
  [ParticipantRole.COMMITTEE]: 2,
  [ParticipantRole.PRESENTER]: 3,
  [ParticipantRole.OBSERVER]: 4,
  [ParticipantRole.SELF_STUDY]: 5,
  [ParticipantRole.GROUP_STUDY]: 6,

  [MemberRole.LEADER]: 1,
  [MemberRole.CO_LEADER]: 2,
  [MemberRole.MEMBER]: 3
}

export const sortParticipantsByRole = <T extends { role: string | ParticipantRoleType; username?: string }>(
  participants: T[],
  currentUsername?: string
): T[] => {
  return [...participants].sort((a, b) => {
    // Current user always first
    if (currentUsername) {
      if (a.username === currentUsername) return -1
      if (b.username === currentUsername) return 1
    }

    const orderA = ROLE_ORDER[a.role] || 99
    const orderB = ROLE_ORDER[b.role] || 99
    return orderA - orderB
  })
}
