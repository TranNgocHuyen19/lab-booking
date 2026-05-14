import http from '@/lib/http'
import type { ApiResponse } from '@/schemas/base.schema'
import type {
  AttendanceSystemConfigResponse,
  BookingSystemConfigResponse,
  SystemConfigHistoryResponse,
  UpdateAttendanceSystemConfigRequest,
  UpdateBookingSystemConfigRequest,
  UpdateConfigFieldRequest
} from '@/schemas/system-config.schema'

const systemConfigService = {
  getAttendanceConfig: () => http.get<ApiResponse<AttendanceSystemConfigResponse>>('/system-configs/attendance'),

  updateAttendanceConfig: (data: UpdateAttendanceSystemConfigRequest) =>
    http.put<ApiResponse<AttendanceSystemConfigResponse>>('/system-configs/attendance', data),

  updateAttendanceField: (key: string, data: UpdateConfigFieldRequest) =>
    http.patch<ApiResponse<AttendanceSystemConfigResponse>>(`/system-configs/attendance/${key}`, data),

  getAttendanceHistory: () =>
    http.get<ApiResponse<SystemConfigHistoryResponse[]>>('/system-configs/attendance/history'),

  getBookingConfig: () => http.get<ApiResponse<BookingSystemConfigResponse>>('/system-configs/booking'),

  updateBookingConfig: (data: UpdateBookingSystemConfigRequest) =>
    http.put<ApiResponse<BookingSystemConfigResponse>>('/system-configs/booking', data),

  updateBookingField: (key: string, data: UpdateConfigFieldRequest) =>
    http.patch<ApiResponse<BookingSystemConfigResponse>>(`/system-configs/booking/${key}`, data),

  getBookingHistory: () => http.get<ApiResponse<SystemConfigHistoryResponse[]>>('/system-configs/booking/history'),

  getAllHistory: () => http.get<ApiResponse<SystemConfigHistoryResponse[]>>('/system-configs/history')
}

export default systemConfigService
