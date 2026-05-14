import labRoomScheduleService from '@/services/lab-room-schedule.service'
import type { FindWeekScheduleParams } from '@/schemas/lab-room-schedule.schema'
import { createQuery, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'

export const useWeekScheduleQuery = (params: FindWeekScheduleParams) => {
  return createQuery({
    queryKey: QUERY_KEYS.LAB_ROOM.SCHEDULE(params),
    queryFn: async () => {
      const response = await labRoomScheduleService.getWeekSchedule(params)
      return response.data.data
    },
    enabled: !!params.date,
    ...QUERY_POLICIES.LIST
  })()
}

export const useAdminWeekScheduleQuery = (params: FindWeekScheduleParams) => {
  return createQuery({
    queryKey: ['ADMIN', ...QUERY_KEYS.LAB_ROOM.SCHEDULE(params)],
    queryFn: async () => {
      const response = await labRoomScheduleService.getWeekScheduleAdmin(params)
      return response.data.data
    },
    enabled: !!params.date,
    ...QUERY_POLICIES.LIST
  })()
}
