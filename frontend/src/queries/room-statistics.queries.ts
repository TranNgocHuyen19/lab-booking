import roomStatisticsService from '@/services/room-statistics.service'
import { createQuery, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'
import type { RoomStatisticsParams, RoomUsageDetailsParams } from '@/schemas/room-statistics.schema'

export const useRoomStatisticsSummaryQuery = (params: RoomStatisticsParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.ROOM_STATISTICS.SUMMARY(params),
    queryFn: () => roomStatisticsService.getSummary(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useRoomStatisticsHeatmapQuery = (params: RoomStatisticsParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.ROOM_STATISTICS.HEATMAP(params),
    queryFn: () => roomStatisticsService.getHeatmap(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useRoomStatisticsUsageDetailsQuery = (params: RoomUsageDetailsParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.ROOM_STATISTICS.USAGE_DETAILS(params),
    queryFn: () => roomStatisticsService.getUsageDetails(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}
