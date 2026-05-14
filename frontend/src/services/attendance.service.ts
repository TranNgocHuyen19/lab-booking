import http from '@/lib/http'
import type { ApiResponse } from '@/schemas/base.schema'
import type {
  CheckInRequest,
  CheckOutRequest,
  AttendanceResponse,
  AttendanceStatusResponse
} from '@/schemas/booking-attendance.schema'

const attendanceService = {
  checkIn: (bookingId: number, body: CheckInRequest) =>
    http.post<ApiResponse<AttendanceResponse>>(`/attendances/${bookingId}/checkin`, body),

  checkOut: (bookingId: number, body: CheckOutRequest) =>
    http.post<ApiResponse<AttendanceResponse>>(`/attendances/${bookingId}/checkout`, body),

  getStatus: (bookingId: number) => http.get<ApiResponse<AttendanceStatusResponse>>(`/attendances/status/${bookingId}`),

  getByBookingId: (bookingId: number) =>
    http.get<ApiResponse<AttendanceResponse[]>>(`/attendances/booking/${bookingId}`)
}

export default attendanceService
