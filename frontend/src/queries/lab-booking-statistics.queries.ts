import type { AxiosResponse } from 'axios'
import labBookingStatisticsService from '@/services/lab-booking-statistics.service'
import { createQuery, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import type {
  LabBookingKpiParams,
  AuditLogParams,
  LabBookingKpiResponse,
  BookingOutcomeResponse,
  SubmissionTrendResponse,
  BookingAuditLogResponse
} from '@/schemas/lab-booking-statistics.schema'

export const useLabBookingKpiQuery = (params: LabBookingKpiParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.KPI(params),
    queryFn: () =>
      labBookingStatisticsService
        .getKpis(params)
        .then((res: AxiosResponse<ApiResponse<LabBookingKpiResponse>>) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useBookingOutcomeDistributionQuery = (params: LabBookingKpiParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.OUTCOME(params),
    queryFn: () =>
      labBookingStatisticsService
        .getOutcomeDistribution(params)
        .then((res: AxiosResponse<ApiResponse<BookingOutcomeResponse[]>>) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useBookingSubmissionTrendQuery = (params: LabBookingKpiParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.TREND(params),
    queryFn: () =>
      labBookingStatisticsService
        .getSubmissionTrend(params)
        .then((res: AxiosResponse<ApiResponse<SubmissionTrendResponse[]>>) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useBookingAuditLogsQuery = (params: AuditLogParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.LAB_BOOKING_STATISTICS.AUDIT_LOGS(params),
    queryFn: () =>
      labBookingStatisticsService
        .getAuditLogs(params)
        .then((res: AxiosResponse<ApiResponse<PageResponse<BookingAuditLogResponse[]>>>) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}
