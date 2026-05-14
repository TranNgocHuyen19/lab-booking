import http from '@/lib/http'
import type { ApiResponse } from '@/schemas/base.schema'
import type {
  DashboardKpiResponse,
  DashboardKpiParams,
  DeviceUsageResponse,
  RoomActivityResponse,
  BookingTypeDistributionResponse,
  BookingTrendResponse
} from '@/schemas/dashboard.schema'

const dashboardService = {
  getKpi: (params: DashboardKpiParams) => http.get<ApiResponse<DashboardKpiResponse>>('/dashboard/kpi', { params }),

  getDeviceUsage: (params: DashboardKpiParams & { limit?: number }) =>
    http.get<ApiResponse<DeviceUsageResponse[]>>('/dashboard/device-usage', { params }),

  getRoomActivity: (params: DashboardKpiParams) =>
    http.get<ApiResponse<RoomActivityResponse[]>>('/dashboard/room-activity', { params }),

  getBookingTypeDistribution: (params: DashboardKpiParams) =>
    http.get<ApiResponse<BookingTypeDistributionResponse[]>>('/dashboard/booking-type', { params }),

  getBookingTrend: (params: DashboardKpiParams) =>
    http.get<ApiResponse<BookingTrendResponse[]>>('/dashboard/room-trend', {
      params
    })
}

export default dashboardService
