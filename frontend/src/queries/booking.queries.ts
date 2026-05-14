import { useQueryClient } from '@tanstack/react-query'
import bookingService from '@/services/booking.service'
import type {
  CreateBookingRequest,
  UpdateBookingRequest,
  CancelBookingRequest,
  BookingStatusRequest
} from '@/schemas/booking.schema'
import { createQuery, createMutation, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'

export const useMyBookingsQuery = (options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.BOOKING.MY,
    queryFn: () => bookingService.getMyBookings().then((res) => res.data.data || []),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useMyGroupBookingsQuery = (options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.BOOKING.MY_GROUPS,
    queryFn: () => bookingService.getMyGroupBookings().then((res) => res.data.data || []),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useBookingByIdQuery = (id: number, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.BOOKING.DETAIL(id),
    queryFn: () => bookingService.getById(id).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

// Admin query - SecureBookingResponse (from /bookings/{id}/admin)
export const useBookingByIdAdminQuery = (id: number, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_BOOKING.DETAIL(id),
    queryFn: () => bookingService.getByIdAdmin(id).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useAdminFilterBookingsQuery = (params: {
  page?: number
  limit?: number
  keyword?: string
  type?: string
  status?: string
  roomId?: number
}) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_BOOKING.FILTER(params),
    queryFn: () => bookingService.filterAdmin(params),
    ...QUERY_POLICIES.LIST
  })()
}

export const useRecentPendingBookingsQuery = (limit: number = 5, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_BOOKING.RECENT_PENDING(limit),
    queryFn: () => bookingService.findRecentPending(limit).then((res) => res.data.data || []),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useBookingParticipantUsernamesQuery = (id: number, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.BOOKING.PARTICIPANT_USERNAMES(id),
    queryFn: () => bookingService.getActiveParticipantUsernames(id),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useBookingParticipantsQuery = (
  id: number,
  params: { page?: number; size?: number; search?: string },
  options?: { enabled?: boolean }
) => {
  return createQuery({
    queryKey: QUERY_KEYS.BOOKING.PARTICIPANTS(id, params),
    queryFn: () => bookingService.getParticipantsDetail(id, params),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useBookingParticipantsBasicQuery = (
  id: number,
  params: { page?: number; size?: number; search?: string },
  options?: { enabled?: boolean }
) => {
  return createQuery({
    queryKey: QUERY_KEYS.BOOKING.PARTICIPANTS_BASIC(id, params),
    queryFn: () => bookingService.getParticipantsBasic(id, params),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: (data: CreateBookingRequest) => bookingService.create(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useUpdateBookingMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBookingRequest }) => bookingService.updateBooking(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useApproveBookingMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ id, data }: { id: number; data?: BookingStatusRequest }) => bookingService.approve(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useRejectBookingMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingStatusRequest }) => bookingService.reject(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ id, data }: { id: number; data?: CancelBookingRequest }) => bookingService.cancel(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useAddParticipantsMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ id, participants }: { id: number; participants: { username: string; role: string }[] }) =>
      bookingService.addParticipants(id, participants),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useSystemCancelBookingMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ id, data }: { id: number; data: BookingStatusRequest }) => bookingService.systemCancel(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useBulkApproveBookingsMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ requestIds, data }: { requestIds: number[]; data?: BookingStatusRequest }) =>
      bookingService.bulkApprove(requestIds, data?.responseNote),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useBulkRejectBookingsMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ requestIds, data }: { requestIds: number[]; data: BookingStatusRequest }) =>
      bookingService.bulkReject(requestIds, data.responseNote || ''),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useBulkSystemCancelBookingsMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ requestIds, data }: { requestIds: number[]; data: BookingStatusRequest }) =>
      bookingService.bulkSystemCancel(requestIds, data.responseNote || ''),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_BOOKING.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOM_STATISTICS.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.ROOT })
      ])
    }
  })()
}

export const useSlotBookingDetailQuery = (
  params: { labRoomId: number; slotId: number; bookingDate: string },
  options?: { enabled?: boolean }
) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_BOOKING.SLOT_DETAIL(params),
    queryFn: () => bookingService.findSlotBookingDetail(params),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useSlotBookingDetailParticipantsQuery = (bookingId: number, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_BOOKING.SLOT_DETAIL_PARTICIPANTS(bookingId),
    queryFn: () => bookingService.findBookingParticipantsForSlotDetail(bookingId),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useBookingStatusHistoryQuery = (bookingId: number, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.BOOKING.STATUS_HISTORY(bookingId),
    queryFn: () => bookingService.findStatusHistory(bookingId),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}
