import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export const formatTime = (time: string | null | undefined): string => {
  if (!time) return ''
  const parts = time.split(':')
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`
  }
  return time
}
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'Chưa cập nhật'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return format(d, 'HH:mm:ss dd/MM/yyyy', { locale: vi })
}

export const formatDateForApi = (date: Date | null | undefined): string => {
  if (!date) return ''
  return format(date, 'yyyy-MM-dd')
}

export const formatDateDisplay = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return format(d, 'dd/MM/yyyy', { locale: vi })
}

export const formatTimeForInput = (time: string | null | undefined): string => {
  if (!time) return ''
  return time.length > 5 ? time.substring(0, 5) : time
}

export const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || minutes === 0) return '0 phút'

  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60

  const parts = []
  if (hours > 0) parts.push(`${hours} giờ`)
  if (remainingMins > 0) parts.push(`${remainingMins} phút`)

  return parts.join(' ')
}

export const formatDateFull = (date: string | Date | null | undefined): string => {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return String(date)
  return format(d, 'eeee, dd/MM/yyyy', { locale: vi })
}

export const formatDateFullShort = (date: string | Date | null | undefined): string => {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return String(date)
  return format(d, 'dd/MM/yyyy', { locale: vi })
}

export const formatFullDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return format(d, 'HH:mm:ss dd/MM/yyyy', { locale: vi })
}

export const formatFullDateTimeCompact = (date: string | Date | null | undefined): string => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  return format(d, 'HH:mm dd/MM/yyyy', { locale: vi })
}
