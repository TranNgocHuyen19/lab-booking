import { z } from 'zod'
import { KpiWithGrowthSchema } from './dashboard.schema'

export interface RoomStatisticsParams {
  startDate: string
  endDate: string
  roomId?: number
  activityType?: 'THESIS' | 'PERSONAL' | 'GROUP'
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'SYSTEM_CANCELED'
}

export interface RoomUsageDetailsParams extends RoomStatisticsParams {
  page?: number
  limit?: number
  sortBy?: 'roomName' | 'slotName' | 'bookingCount' | 'totalHours' | 'participantCount' | 'usageRate' | 'canceledCount'
  order?: 'asc' | 'desc'
}

export const RoomInfoSchema = z.object({
  roomName: z.string(),
  usageRate: z.number(),
  bookingCount: z.number()
})

export type RoomInfo = z.infer<typeof RoomInfoSchema>

export const ShiftPeakInfoSchema = z.object({
  shiftName: z.string(),
  usageRate: z.number()
})

export type ShiftPeakInfo = z.infer<typeof ShiftPeakInfoSchema>

export const RoomStatisticsSummaryResponseSchema = z.object({
  usageRate: KpiWithGrowthSchema,
  mostUsedRoom: RoomInfoSchema,
  leastUsedRoom: RoomInfoSchema,
  peakShift: ShiftPeakInfoSchema
})

export type RoomStatisticsSummaryResponse = z.infer<typeof RoomStatisticsSummaryResponseSchema>

export const ShiftUsageSchema = z.object({
  slotId: z.number(),
  slotName: z.string(),
  timeRange: z.string(),
  usageRate: z.number(),
  bookingCount: z.number()
})

export type ShiftUsage = z.infer<typeof ShiftUsageSchema>

export const RoomHeatmapResponseSchema = z.object({
  roomName: z.string(),
  roomId: z.number(),
  shifts: z.array(ShiftUsageSchema)
})

export type RoomHeatmapResponse = z.infer<typeof RoomHeatmapResponseSchema>

export const RoomUsageDetailResponseSchema = z.object({
  roomId: z.number(),
  roomName: z.string(),
  slotId: z.number(),
  slotName: z.string(),
  bookingCount: z.number(),
  totalHours: z.number(),
  participantCount: z.number(),
  usageRate: z.number(),
  canceledCount: z.number()
})

export type RoomUsageDetailResponse = z.infer<typeof RoomUsageDetailResponseSchema>
