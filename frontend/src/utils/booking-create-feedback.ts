import axios from 'axios'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'
import type { DuplicateConflictDetail } from '@/components/common/duplicate-confirm-dialog'

type BookingFeedbackItem = {
  code?: string
  message?: string
  relatedUserId?: number | null
  relatedBookingRequestId?: number | null
}

type ParticipantConflictItem = {
  userId?: number | null
  conflictingBookingRequestId?: number | null
  conflictingBookingType?: string | null
  suggestedParticipantStatus?: string | null
  message?: string
}

type BookingParticipantItem = {
  userId?: number | null
  username?: string | null
  fullName?: string | null
  status?: string | null
}

type BookingSlotItem = {
  slotName?: string | null
  startTime?: string | null
  endTime?: string | null
}

type ExistingScheduleConflictItem = {
  code?: string
  message?: string
  userId?: number | null
  conflictingBookingRequestId?: number | null
  conflictingBookingType?: string | null
  bookingDate?: string | null
  slotId?: number | null
  labRoomId?: number | null
  roomName?: string | null
  building?: string | null
  slotName?: string | null
  startTime?: string | null
  endTime?: string | null
  devices?: Array<{
    deviceId?: number | null
    deviceName?: string | null
    deviceType?: string | null
    quantity?: number | null
  }> | null
  suggestedAction?: string | null
}

type BookingValidationPayload = {
  errors?: BookingFeedbackItem[]
  warnings?: BookingFeedbackItem[]
  participantConflicts?: ParticipantConflictItem[]
  existingScheduleConflicts?: ExistingScheduleConflictItem[]
}

type BookingCreatePayload = BookingValidationPayload & {
  bookingRequestId?: number
  status?: string
  bookingDate?: string
  participants?: BookingParticipantItem[]
  slots?: BookingSlotItem[]
}

export type BookingCreateWarningDialog = {
  title: string
  description: string
  note: string
  confirmLabel: string
  conflictDetails: DuplicateConflictDetail[]
  showCancel?: boolean
  cancelLabel?: string
  onConfirm?: () => void
}

const buildScheduleConflictDialogFromValidation = (
  validationData?: BookingValidationPayload
): BookingCreateWarningDialog | null => {
  const existingScheduleConflicts = validationData?.existingScheduleConflicts || []
  if (existingScheduleConflicts.length === 0) return null

  const devicesList = (devices?: ExistingScheduleConflictItem['devices'] | null) => {
    return (devices || [])
      .filter((d) => (d?.quantity || 0) > 0)
      .map((d) => {
        const name = d?.deviceName || (d?.deviceId ? `Thiết bị #${d.deviceId}` : 'Thiết bị')
        return `${name} x${d?.quantity}`
      })
  }

  const devicesText = (devices?: ExistingScheduleConflictItem['devices'] | null) => {
    return devicesList(devices).length > 0 ? undefined : 'Không có'
  }

  const conflictDetails: DuplicateConflictDetail[] = existingScheduleConflicts.map((conflict) => {
    const room = conflict.roomName
      ? `${conflict.roomName}${
          conflict.building
            ? ` - ${
                conflict.building.toLowerCase().includes('building')
                  ? conflict.building
                  : `${conflict.building} Building`
              }`
            : ''
        }`
      : conflict.labRoomId
        ? `Phòng #${conflict.labRoomId}`
        : ''

    const date = formatDate(conflict.bookingDate)

    const slotLabel = conflict.slotName || (conflict.slotId ? `Ca #${conflict.slotId}` : '')
    const timeRange =
      conflict.startTime || conflict.endTime
        ? ` (${formatTime(conflict.startTime)} - ${formatTime(conflict.endTime)})`
        : ''

    const bookingTypeLabel =
      conflict.conflictingBookingType === 'PERSONAL'
        ? 'Lịch cá nhân'
        : conflict.conflictingBookingType === 'GROUP'
          ? 'Lịch nhóm'
          : conflict.conflictingBookingType || 'Lịch'

    const oldBookingActionText = conflict.conflictingBookingType === 'GROUP' ? 'rút khỏi' : 'hủy'

    return {
      title: 'Lịch cũ trùng với đăng ký mới',
      room,
      date,
      slot: `${slotLabel}${timeRange}`.trim(),
      bookingTypeLabel,
      devicesText: devicesText(conflict.devices),
      devicesList: devicesList(conflict.devices),
      status: 'Trùng lịch',
      instruction: `Nếu chọn “Chuyển lịch”, lịch cũ này sẽ bị ${oldBookingActionText} và hệ thống sẽ tạo lịch mới theo thông tin trong mục “Thông tin đăng ký phòng lab”.`
    }
  })

  return {
    title: 'Xác nhận chuyển lịch đặt phòng',
    description: 'Bạn đang có lịch đặt phòng khác trùng với thời gian đã chọn.',
    note: 'Lưu ý: Nếu chọn “Chuyển lịch”, hệ thống sẽ hủy/rút khỏi lịch cũ và tạo lịch mới theo thông tin đăng ký hiện tại. Thiết bị của lịch cũ sẽ được giải phóng. Thiết bị của lịch mới sẽ là số lượng bạn đang chọn trong mục “Thiết bị sử dụng”.',
    confirmLabel: 'CHUYỂN LỊCH',
    showCancel: true,
    cancelLabel: 'GIỮ LỊCH CŨ',
    conflictDetails
  }
}

const pickBookingData = (response: unknown): BookingCreatePayload | undefined => {
  if (!response || typeof response !== 'object') return undefined

  const maybeAxios = response as { data?: { data?: BookingCreatePayload } }
  return maybeAxios.data?.data
}

const formatTime = (value?: string | null) => {
  if (!value) return ''
  return value.length >= 5 ? value.slice(0, 5) : value
}

const formatDate = (value?: string | null) => {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

const participantStatusLabel = (status?: string | null) => {
  switch (status) {
    case 'ACTIVE':
      return 'Đang tham gia'
    case 'CONFIRMED':
      return 'Đã xác nhận'
    case 'INVITED':
      return 'Đã được mời'
    case 'PENDING_CONFLICT_RESOLUTION':
      return 'Chờ xử lý trùng lịch'
    default:
      return status || 'Chờ xử lý'
  }
}

const warningMessage = (warning: BookingFeedbackItem) => {
  switch (warning.code) {
    case 'GROUP_PARTICIPANT_PERSONAL_BOOKING_CONFLICT':
      return 'Có thành viên đang có booking cá nhân trong cùng thời gian.'
    default:
      return warning.message || warning.code || 'Có cảnh báo khi tạo booking.'
  }
}

const buildSlotText = (data?: BookingCreatePayload) => {
  const date = formatDate(data?.bookingDate)
  const slots = data?.slots || []

  if (slots.length === 0) return date || 'Thời gian đã chọn'

  const slotText = slots
    .map((slot) => {
      const timeRange =
        slot.startTime || slot.endTime ? ` (${formatTime(slot.startTime)} - ${formatTime(slot.endTime)})` : ''
      return `${slot.slotName || 'Ca sử dụng'}${timeRange}`
    })
    .join(', ')

  return date ? `${date}: ${slotText}` : slotText
}

export const buildBookingCreateWarningDialog = (response: unknown): BookingCreateWarningDialog | null => {
  const data = pickBookingData(response)
  const warnings = data?.warnings || []
  const participantConflicts = data?.participantConflicts || []

  if (warnings.length === 0 && participantConflicts.length === 0) return null

  const participants = data?.participants || []
  const slotText = buildSlotText(data)

  const conflictDetails: DuplicateConflictDetail[] = participantConflicts.map((conflict) => {
    const participant = participants.find((item) => item.userId === conflict.userId)
    const displayName = participant?.fullName || participant?.username || `User #${conflict.userId || '?'}`
    const username = participant?.username ? `Mã số: ${participant.username}` : undefined
    const source =
      conflict.conflictingBookingType === 'PERSONAL'
        ? 'Bị trùng với booking cá nhân đã có.'
        : conflict.conflictingBookingType === 'GROUP'
          ? 'Bị trùng với booking nhóm đã có.'
          : conflict.message || 'Bị trùng với booking khác.'
    return {
      title: displayName,
      subtitle: username ? `${username}. ${source}` : source,
      time: slotText,
      status: participantStatusLabel(conflict.suggestedParticipantStatus || participant?.status),
      instruction:
        'Thành viên này cần hủy booking cá nhân để tham gia nhóm, hoặc giữ booking cũ và từ chối booking nhóm.'
    }
  })

  warnings.forEach((warning) => {
    if (warning.relatedUserId && conflictDetails.some((item) => item.title.includes(`#${warning.relatedUserId}`))) {
      return
    }

    conflictDetails.push({
      title: warningMessage(warning),
      time: slotText,
      status: 'Cảnh báo',
      instruction: 'Booking vẫn được tạo, nhưng cần kiểm tra lại trước khi duyệt hoặc xác nhận tham gia.'
    })
  })

  return {
    title: 'Booking đã được tạo kèm cảnh báo',
    description:
      'Một số thành viên đang bị trùng lịch. Booking vẫn được tạo, nhưng các thành viên này cần xử lý trước khi tham gia.',
    note: 'Hệ thống không tự hủy booking cá nhân. Thành viên bị trùng lịch phải tự chọn: hủy booking cũ để tham gia nhóm, hoặc giữ booking cũ và từ chối booking nhóm.',
    confirmLabel: 'Đã hiểu',
    conflictDetails
  }
}

export const showBookingCreateFeedback = (response: unknown) => {
  const warningDialog = buildBookingCreateWarningDialog(response)

  if (!warningDialog) {
    toast.success('Gửi yêu cầu đăng ký thành công')
  }

  return warningDialog
}

export const handleBookingCreateError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    handleErrorApi({ error })
    return
  }

  const errorBody = error.response?.data as
    | {
        code?: number
        message?: string
        data?: BookingValidationPayload
      }
    | undefined

  const validationData = errorBody?.data
  const validationErrors = validationData?.errors || []
  const participantConflicts = validationData?.participantConflicts || []

  if (errorBody?.code === 2628 && (validationErrors.length > 0 || participantConflicts.length > 0)) {
    const messages = [
      ...validationErrors.map((item) => warningMessage(item)),
      ...participantConflicts.map((item) => item.message || 'Có thành viên bị trùng lịch.')
    ]

    toast.error('Không thể tạo booking', {
      description: messages.filter(Boolean).join('\n'),
      duration: 9000
    })
    return
  }

  handleErrorApi({ error })
}

export const getScheduleConflictDetails = (error: unknown): BookingCreateWarningDialog | null => {
  if (!axios.isAxiosError(error)) return null

  const errorBody = error.response?.data as
    | {
        code?: number
        message?: string
        data?: BookingValidationPayload
      }
    | undefined
  const validationData = errorBody?.data
  return buildScheduleConflictDialogFromValidation(validationData)
}
