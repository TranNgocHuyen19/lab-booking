import { addDays, startOfMonth, endOfMonth } from 'date-fns'
import { formatDateForApi } from './format'

export type FilterMode = 'today' | '7d' | 'month' | 'range'

export const calculateDateRange = (mode: FilterMode, from?: string, to?: string, month?: string, year?: string) => {
  const now = new Date()
  let startDate: Date
  let endDate: Date = now

  switch (mode) {
    case 'today':
      startDate = now
      endDate = now
      break
    case '7d':
      startDate = addDays(now, -7)
      endDate = now
      break
    case 'month':
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
      break
    case 'range':
      if (month && year) {
        const date = new Date(Number(year), Number(month) - 1, 1)
        startDate = startOfMonth(date)
        endDate = endOfMonth(date)
      } else {
        startDate = from ? new Date(from) : now
        endDate = to ? new Date(to) : now
      }
      break
    default:
      startDate = now
      endDate = now
  }

  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate)
  }
}
