import { researchGroupStatisticsService } from '@/services/research-group-statistics.service'
import { createQuery, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'
import type { GroupStatisticsParams, GroupUsageDetailsParams } from '@/schemas/research-group-statistics.schema'

export const useGroupStatisticsSummaryQuery = (params: GroupStatisticsParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP_STATISTICS.SUMMARY(params),
    queryFn: () => researchGroupStatisticsService.getSummary(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useGroupStatisticsDistributionQuery = (params: GroupStatisticsParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP_STATISTICS.DISTRIBUTION(params),
    queryFn: () => researchGroupStatisticsService.getDistribution(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useGroupStatisticsUsageDetailsQuery = (
  params: GroupUsageDetailsParams,
  options?: { enabled?: boolean }
) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP_STATISTICS.USAGE_DETAILS(params),
    queryFn: () => researchGroupStatisticsService.getUsageDetails(params).then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}
