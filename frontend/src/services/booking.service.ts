import http from '@/lib/http'
import type { ApiResponse } from '@/schemas/base.schema'
import type {
  BookingResponse,
  CreateBookingRequest,
  CancelBookingRequest,
  BookingStatusRequest,
  ResolveParticipantConflictRequest,
  PaginatedParticipantResponse,
  PaginatedBookingParticipantResponse,
  PaginatedSecureBookingResponse,
  SecureBookingResponse,
  UpdateBookingRequest,
  PendingBookingResponse,
  SlotBookingDetailResponse,
  SlotBookingDetailParticipant
} from '@/schemas/booking.schema'
import type { BookingStatusHistoryResponse } from '@/schemas/booking-status-history.schema'

const bookingService = {
  findRecentPending: (limit: number = 5) =>
    http.get<ApiResponse<PendingBookingResponse[]>>('/bookings/pending', { params: { limit } }),
  create: (body: CreateBookingRequest) => http.post<ApiResponse<BookingResponse>>('/bookings', body),

  getMyBookings: () => http.get<ApiResponse<BookingResponse[]>>('/bookings/my'),
  getMyGroupBookings: () => http.get<ApiResponse<SecureBookingResponse[]>>('/bookings/my-groups'),
  getParticipantsDetail: async (
    id: number,
    params: {
      page?: number
      size?: number
      search?: string
    }
  ): Promise<PaginatedParticipantResponse> => {
    const response = await http.get<ApiResponse<PaginatedParticipantResponse>>(`/bookings/${id}/participants-detail`, {
      params
    })
    return response.data.data
  },
  getParticipantsBasic: async (
    id: number,
    params: {
      page?: number
      size?: number
      search?: string
    }
  ): Promise<PaginatedBookingParticipantResponse> => {
    const response = await http.get<ApiResponse<PaginatedBookingParticipantResponse>>(`/bookings/${id}/participants`, {
      params
    })
    return response.data.data
  },
  updateBooking: (id: number, body: UpdateBookingRequest) =>
    http.patch<ApiResponse<BookingResponse>>(`/bookings/${id}`, body),
  cancel: (id: number, body?: CancelBookingRequest) =>
    http.post<ApiResponse<BookingResponse>>(`/bookings/${id}`, { data: body }),
  resolveParticipantConflict: (participantId: number, body: ResolveParticipantConflictRequest) =>
    http.post<ApiResponse<void>>(`/bookings/participants/${participantId}/resolve-conflict`, body),
  approve: (id: number, body?: BookingStatusRequest) =>
    http.post<ApiResponse<SecureBookingResponse>>(`/bookings/${id}/approve`, body || {}),
  reject: (id: number, body: BookingStatusRequest) =>
    http.post<ApiResponse<SecureBookingResponse>>(`/bookings/${id}/reject`, body),
  addParticipants: (id: number, participants: { username: string; role: string }[]) =>
    http.post<ApiResponse<BookingResponse>>(`/bookings/${id}/participants`, participants),
  getById: (id: number) => http.get<ApiResponse<BookingResponse>>(`/bookings/${id}`),
  getByIdAdmin: (id: number) => http.get<ApiResponse<SecureBookingResponse>>(`/bookings/${id}/admin`),
  systemCancel: (id: number, body: BookingStatusRequest) =>
    http.post<ApiResponse<SecureBookingResponse>>(`/bookings/${id}/system-cancel`, body),
  filterAdmin: async (params: {
    page?: number
    limit?: number
    keyword?: string
    type?: string
    status?: string
    roomId?: number
  }) => {
    const response = await http.get<ApiResponse<PaginatedSecureBookingResponse>>('/bookings/admin', { params })
    return response.data.data
  },
  getActiveParticipantUsernames: (id: number) =>
    http.get<ApiResponse<string[]>>(`/bookings/${id}/participant-usernames`).then((res) => res.data.data),
  bulkApprove: (requestIds: number[], reason?: string) =>
    http.post<ApiResponse<void>>('/bookings/actions/bulk-approve', { requestIds, reason }),
  bulkReject: (requestIds: number[], reason: string) =>
    http.post<ApiResponse<void>>('/bookings/actions/bulk-reject', { requestIds, reason }),
  bulkSystemCancel: (requestIds: number[], reason: string) =>
    http.post<ApiResponse<void>>('/bookings/actions/bulk-system-cancel', { requestIds, reason }),

  findSlotBookingDetail: async (params: { labRoomId: number; slotId: number; bookingDate: string }) => {
    const response = await http.get<ApiResponse<SlotBookingDetailResponse>>('/bookings/slot-detail', { params })
    return response.data.data
  },

  findBookingParticipantsForSlotDetail: async (bookingId: number) => {
    const response = await http.get<ApiResponse<SlotBookingDetailParticipant[]>>(
      `/bookings/${bookingId}/slot-detail-participants`
    )
    return response.data.data
  },

  findStatusHistory: async (bookingId: number): Promise<BookingStatusHistoryResponse[]> => {
    const response = await http.get<ApiResponse<BookingStatusHistoryResponse[]>>(
      `/bookings/${bookingId}/status-history`
    )
    return response.data.data
  }
}

export default bookingService
