import http from '@/lib/http'
import type { ApiResponse } from '@/schemas/base.schema'
import type { PageResponse } from '@/schemas/base.schema'
import type {
  GroupStatisticsParams,
  GroupStatisticsSummaryResponse,
  GroupUsageShiftStat,
  GroupUsageDetailsParams,
  GroupUsageDetailResponse
} from '@/schemas/research-group-statistics.schema'

const PREFIX = '/admin/statistics/groups'

export const researchGroupStatisticsService = {
  getSummary: (params: GroupStatisticsParams) =>
    http.get<ApiResponse<GroupStatisticsSummaryResponse>>(`${PREFIX}/summary`, { params }),

  getDistribution: (params: GroupStatisticsParams) =>
    http.get<ApiResponse<GroupUsageShiftStat[]>>(`${PREFIX}/distribution`, { params }),

  getUsageDetails: (params: GroupUsageDetailsParams) =>
    http.get<ApiResponse<PageResponse<GroupUsageDetailResponse[]>>>(`${PREFIX}/usage-details`, { params })
}
