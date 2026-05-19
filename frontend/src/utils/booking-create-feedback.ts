import axios from 'axios'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'

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

type BookingValidationPayload = {
  errors?: BookingFeedbackItem[]
  warnings?: BookingFeedbackItem[]
  participantConflicts?: ParticipantConflictItem[]
}

type BookingCreatePayload = BookingValidationPayload & {
  bookingRequestId?: number
  status?: string
}

const pickBookingData = (response: unknown): BookingCreatePayload | undefined => {
  if (!response || typeof response !== 'object') return undefined

  const maybeAxios = response as { data?: { data?: BookingCreatePayload } }
  return maybeAxios.data?.data
}

const formatWarning = (warning: BookingFeedbackItem) => {
  const suffix = warning.relatedUserId ? ` (user #${warning.relatedUserId})` : ''
  return `${warning.message || warning.code || 'Canh bao booking'}${suffix}`
}

const formatConflict = (conflict: ParticipantConflictItem) => {
  const user = conflict.userId ? `User #${conflict.userId}` : 'Thanh vien'
  const status = conflict.suggestedParticipantStatus ? ` -> ${conflict.suggestedParticipantStatus}` : ''
  return `${user}: ${conflict.message || 'Can xu ly trung lich'}${status}`
}

const joinMessages = (messages: string[]) => {
  const visible = messages.filter(Boolean).slice(0, 4)
  const remaining = messages.length - visible.length
  return remaining > 0 ? `${visible.join('\n')}\n...va ${remaining} canh bao/lỗi khac` : visible.join('\n')
}

export const showBookingCreateFeedback = (response: unknown) => {
  const data = pickBookingData(response)
  const warnings = data?.warnings || []
  const participantConflicts = data?.participantConflicts || []

  if (warnings.length === 0 && participantConflicts.length === 0) {
    toast.success('Gui yeu cau dang ky thanh cong')
    return
  }

  const messages = [...warnings.map(formatWarning), ...participantConflicts.map(formatConflict)]

  toast.warning('Booking da duoc tao kem canh bao', {
    description: joinMessages(messages),
    duration: 8000
  })
}

export const handleBookingCreateError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    handleErrorApi({ error })
    return
  }

  const errorBody = error.response?.data as {
    code?: number
    message?: string
    data?: BookingValidationPayload
  } | undefined

  const validationData = errorBody?.data
  const validationErrors = validationData?.errors || []
  const participantConflicts = validationData?.participantConflicts || []

  if (errorBody?.code === 2628 && (validationErrors.length > 0 || participantConflicts.length > 0)) {
    const messages = [...validationErrors.map(formatWarning), ...participantConflicts.map(formatConflict)]

    toast.error('Khong the tao booking', {
      description: joinMessages(messages),
      duration: 9000
    })
    return
  }

  handleErrorApi({ error })
}
