import dashboardService from '@/services/dashboard.service'
import { createQuery, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'
import type { DashboardKpiParams } from '@/schemas/dashboard.schema'

export const useDashboardKpiQuery = (params: DashboardKpiParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.DASHBOARD.KPI(params),
    queryFn: () => dashboardService.getKpi(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useDeviceUsageQuery = (
  params: DashboardKpiParams & { limit?: number },
  options?: { enabled?: boolean }
) => {
  return createQuery({
    queryKey: QUERY_KEYS.DASHBOARD.DEVICE_USAGE(params),
    queryFn: () => dashboardService.getDeviceUsage(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.STATIC
  })()
}

export const useRoomActivityQuery = (params: DashboardKpiParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.DASHBOARD.ROOM_ACTIVITY(params),
    queryFn: () => dashboardService.getRoomActivity(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useBookingTypeDistributionQuery = (params: DashboardKpiParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.DASHBOARD.BOOKING_TYPE(params),
    queryFn: () => dashboardService.getBookingTypeDistribution(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useBookingTrendQuery = (params: DashboardKpiParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.DASHBOARD.BOOKING_TREND(params),
    queryFn: () => dashboardService.getBookingTrend(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}
