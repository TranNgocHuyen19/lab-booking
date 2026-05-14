import attendanceService from '@/services/attendance.service'
import { createQuery, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'

export const useBookingAttendanceQuery = (bookingId: number, options = {}) => {
  return createQuery({
    queryKey: QUERY_KEYS.ATTENDANCE.BY_BOOKING(bookingId),
    queryFn: async () => {
      const response = await attendanceService.getByBookingId(bookingId)
      return response.data.data
    },
    enabled: !!bookingId,
    ...QUERY_POLICIES.DETAIL
  })(options)
}

export const useAttendanceStatusQuery = (bookingId: number, options = {}) => {
  return createQuery({
    queryKey: QUERY_KEYS.ATTENDANCE.STATUS(bookingId),
    queryFn: async () => {
      const response = await attendanceService.getStatus(bookingId)
      return response.data.data
    },
    enabled: !!bookingId,
    ...QUERY_POLICIES.REALTIME
  })(options)
}
