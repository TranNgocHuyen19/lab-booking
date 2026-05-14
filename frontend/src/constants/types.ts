export const Role = {
  ADMIN: 'ADMIN',
  LECTURER: 'LECTURER',
  STUDENT: 'STUDENT',
  LAB_MANAGER: 'LAB_MANAGER'
} as const

export type RoleType = (typeof Role)[keyof typeof Role]

export const GroupType = {
  THESIS: 'THESIS',
  RESEARCH: 'RESEARCH'
} as const

export type GroupTypeType = (typeof GroupType)[keyof typeof GroupType]

export const GroupTypeLabel: Record<GroupTypeType, string> = {
  THESIS: 'KLTN',
  RESEARCH: 'Nghiên cứu'
}

export const ActiveLabel = {
  true: 'Hoạt động',
  false: 'Đã khóa'
} as const

export const MemberRole = {
  MEMBER: 'MEMBER',
  CO_LEADER: 'CO_LEADER',
  LEADER: 'LEADER'
} as const

export type MemberRoleType = (typeof MemberRole)[keyof typeof MemberRole]

export const MemberRoleLabel: Record<MemberRoleType, string> = {
  MEMBER: 'Thành viên',
  CO_LEADER: 'Trưởng nhóm',
  LEADER: 'GVHD'
}

export const RequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELED: 'CANCELED',
  SYSTEM_CANCELED: 'SYSTEM_CANCELED'
} as const

export type RequestStatusType = (typeof RequestStatus)[keyof typeof RequestStatus]

export const RequestStatusLabels = {
  PENDING: 'Chờ xác nhận',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Bị từ chối',
  CANCELED: 'Đã hủy',
  SYSTEM_CANCELED: 'Hủy bởi hệ thống'
} as const

export const BookingType = {
  THESIS: 'THESIS',
  PERSONAL: 'PERSONAL',
  GROUP: 'GROUP'
} as const

export type BookingTypeType = (typeof BookingType)[keyof typeof BookingType]

export const BookingTypeLabels = {
  THESIS: 'Báo cáo KLTN',
  PERSONAL: 'Học tập cá nhân',
  GROUP: 'Thảo luận nhóm'
} as const

export const ParticipantRole = {
  SUPERVISOR: 'SUPERVISOR',
  PRESENTER: 'PRESENTER',
  COMMITTEE: 'COMMITTEE',
  OBSERVER: 'OBSERVER',
  SELF_STUDY: 'SELF_STUDY',
  GROUP_STUDY: 'GROUP_STUDY'
} as const

export type ParticipantRoleType = (typeof ParticipantRole)[keyof typeof ParticipantRole]

export const ParticipantRoleLabels = {
  SUPERVISOR: 'Giảng viên hướng dẫn',
  PRESENTER: 'Sinh viên báo cáo',
  COMMITTEE: 'Hội đồng phản biện',
  OBSERVER: 'Thành viên dự thính',
  SELF_STUDY: 'Tự học',
  GROUP_STUDY: 'Thảo luận nhóm'
} as const

export const ParticipantStatus = {
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED'
} as const

export type ParticipantStatusType = (typeof ParticipantStatus)[keyof typeof ParticipantStatus]

export const CheckinStatus = {
  NOT_CHECKED_IN: 'NOT_CHECKED_IN',
  CHECKED_IN: 'CHECKED_IN',
  LATE: 'LATE'
} as const

export type CheckinStatusType = (typeof CheckinStatus)[keyof typeof CheckinStatus]

export const CheckoutStatus = {
  NOT_CHECKED_OUT: 'NOT_CHECKED_OUT',
  CHECKED_OUT: 'CHECKED_OUT',
  LEFT_EARLY: 'LEFT_EARLY',
  LATE_CHECKOUT: 'LATE_CHECKOUT'
} as const

export type CheckoutStatusType = (typeof CheckoutStatus)[keyof typeof CheckoutStatus]

export const RoomStatus = {
  AVAILABLE: 'Trống',
  OCCUPIED: 'Còn chỗ',
  FULL: 'Hết chỗ',
  EXPIRED: 'Đã kết thúc',
  CLOSED: 'Nghỉ'
} as const

export type RoomStatusType = keyof typeof RoomStatus

export const RoomStatusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'AVAILABLE', label: 'Trống' },
  { value: 'OCCUPIED', label: 'Đã có lịch' },
  { value: 'FULL', label: 'Hết chỗ' },
  { value: 'EXPIRED', label: 'Đã kết thúc' }
] as const

export const BookingStatusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'APPROVED', label: 'Đã xác nhận' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'CANCELED', label: 'Đã hủy' },
  { value: 'SYSTEM_CANCELED', label: 'Hủy bởi hệ thống' }
] as const

export const StatusChangeReason = {
  NEW_REQUEST: 'NEW_REQUEST',
  USER_CANCELED: 'USER_CANCELED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SYSTEM_OVERRIDE_THESIS: 'SYSTEM_OVERRIDE_THESIS',
  SYSTEM_EXPIRED: 'SYSTEM_EXPIRED',
  OTHER: 'OTHER'
} as const

export type StatusChangeReasonType = (typeof StatusChangeReason)[keyof typeof StatusChangeReason]

export const StatusChangeReasonLabels: Record<StatusChangeReasonType, string> = {
  NEW_REQUEST: 'Tạo yêu cầu mới',
  USER_CANCELED: 'Người dùng hủy',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Bị từ chối',
  SYSTEM_OVERRIDE_THESIS: 'Hệ thống ghi đè (KLTN)',
  SYSTEM_EXPIRED: 'Hết hạn hệ thống',
  OTHER: 'Khác'
}
