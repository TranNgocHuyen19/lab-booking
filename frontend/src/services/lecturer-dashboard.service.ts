import http from '@/lib/http'
import { type ApiResponse } from '@/schemas/base.schema'
import type { LecturerDashboardResponse } from '@/schemas/lecturer-dashboard.schema'

export const lecturerDashboardService = {
  getLecturerDashboard: async (params: { fromDate: string; toDate: string }) => {
    const response = await http.get<ApiResponse<LecturerDashboardResponse>>('/lecturer/dashboard', {
      params
    })
    return response.data.data
  }
}
