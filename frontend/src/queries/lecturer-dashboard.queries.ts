import { createQuery } from '@/query-core'
import { QUERY_KEYS } from '@/query-core/query-keys'
import { lecturerDashboardService } from '@/services/lecturer-dashboard.service'

export const useLecturerDashboardQuery = (params: { fromDate: string; toDate: string }) =>
  createQuery({
    queryKey: QUERY_KEYS.LECTURER_DASHBOARD.DATA(params),
    queryFn: () => lecturerDashboardService.getLecturerDashboard(params)
  })()
