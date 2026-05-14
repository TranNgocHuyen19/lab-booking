import http from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import type {
  RoomStatisticsParams,
  RoomStatisticsSummaryResponse,
  RoomHeatmapResponse,
  RoomUsageDetailResponse,
  RoomUsageDetailsParams
} from '@/schemas/room-statistics.schema'

const BASE_URL = '/api/v1/admin/statistics/rooms'

const roomStatisticsService = {
  getSummary: (params: RoomStatisticsParams) =>
    http.get<ApiResponse<RoomStatisticsSummaryResponse>>(`${BASE_URL}/summary`, { params }),

  getHeatmap: (params: RoomStatisticsParams) =>
    http.get<ApiResponse<RoomHeatmapResponse[]>>(`${BASE_URL}/heatmap`, { params }),

  getUsageDetails: (params: RoomUsageDetailsParams) =>
    http.get<ApiResponse<PageResponse<RoomUsageDetailResponse[]>>>(`${BASE_URL}/usage-details`, { params })
}

export default roomStatisticsService
