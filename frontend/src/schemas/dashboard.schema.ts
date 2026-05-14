import { z } from 'zod'

export const ShiftInfoSchema = z.object({
  shiftName: z.string(),
  timeRange: z.string()
})

export type ShiftInfo = z.infer<typeof ShiftInfoSchema>

export const KpiWithGrowthSchema = z.object({
  value: z.number(),
  growth: z.number(),
  isUp: z.boolean()
})

export type KpiWithGrowth = z.infer<typeof KpiWithGrowthSchema>

export const DashboardKpiResponseSchema = z.object({
  totalBooking: KpiWithGrowthSchema,
  usageRate: KpiWithGrowthSchema,
  peakShift: ShiftInfoSchema,
  lowShift: ShiftInfoSchema,
  pendingApproval: KpiWithGrowthSchema,
  noShowRate: KpiWithGrowthSchema
})

export type DashboardKpiResponse = z.infer<typeof DashboardKpiResponseSchema>

export interface DashboardKpiParams {
  fromDate: string
  toDate: string
}

export const DeviceUsageResponseSchema = z.object({
  name: z.string(),
  count: z.number()
})

export type DeviceUsageResponse = z.infer<typeof DeviceUsageResponseSchema>

export const SlotStatSchema = z.object({
  slotName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  count: z.number()
})

export type SlotStat = z.infer<typeof SlotStatSchema>

export const RoomActivityResponseSchema = z.object({
  roomName: z.string(),
  slots: z.array(SlotStatSchema)
})

export type RoomActivityResponse = z.infer<typeof RoomActivityResponseSchema>

export const BookingTypeDistributionResponseSchema = z.object({
  name: z.string(),
  value: z.number()
})

export type BookingTypeDistributionResponse = z.infer<typeof BookingTypeDistributionResponseSchema>

export const BookingTrendResponseSchema = z.object({
  date: z.string(),
  count: z.number()
})

export type BookingTrendResponse = z.infer<typeof BookingTrendResponseSchema>
