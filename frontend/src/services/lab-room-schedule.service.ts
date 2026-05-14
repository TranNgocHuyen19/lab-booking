import http from '@/lib/http'
import type { ApiResponse } from '@/schemas/base.schema'
import type { WeekScheduleResponse, FindWeekScheduleParams } from '@/schemas/lab-room-schedule.schema'

const labRoomScheduleService = {
  getWeekSchedule: (params: FindWeekScheduleParams) =>
    http.get<ApiResponse<WeekScheduleResponse>>('/lab-rooms/schedule', {
      params
    }),

  getWeekScheduleAdmin: (params: FindWeekScheduleParams) =>
    http.get<ApiResponse<WeekScheduleResponse>>('/lab-rooms/schedule/admin', {
      params
    })
}

export default labRoomScheduleService
