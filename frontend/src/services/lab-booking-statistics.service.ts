import http from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import type {
  AuditLogParams,
  BookingAuditLogResponse,
  BookingOutcomeResponse,
  LabBookingKpiParams,
  LabBookingKpiResponse,
  SubmissionTrendResponse
} from '@/schemas/lab-booking-statistics.schema'

const labBookingStatisticsService = {
  getKpis: (params: LabBookingKpiParams) =>
    http.get<ApiResponse<LabBookingKpiResponse>>('/admin/statistics/lab-bookings/kpis', { params }),

  getOutcomeDistribution: (params: LabBookingKpiParams) =>
    http.get<ApiResponse<BookingOutcomeResponse[]>>('/admin/statistics/lab-bookings/outcome-distribution', {
      params
    }),

  getSubmissionTrend: (params: LabBookingKpiParams) =>
    http.get<ApiResponse<SubmissionTrendResponse[]>>('/admin/statistics/lab-bookings/submission-trend', {
      params
    }),

  getAuditLogs: (params: AuditLogParams) =>
    http.get<ApiResponse<PageResponse<BookingAuditLogResponse[]>>>('/admin/statistics/lab-bookings/audit-logs', {
      params
    })
}

export default labBookingStatisticsService
