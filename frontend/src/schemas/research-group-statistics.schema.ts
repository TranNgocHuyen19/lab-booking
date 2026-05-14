import { z } from 'zod'
import { KpiWithGrowthSchema } from './dashboard.schema'

export interface GroupStatisticsParams {
  startDate: string
  endDate: string
  groupType?: 'RESEARCH' | 'THESIS'
  lecturerId?: number
}

export interface GroupUsageDetailsParams extends GroupStatisticsParams {
  page?: number
  limit?: number
  sortBy?: 'groupName' | 'groupType' | 'lecturerName' | 'totalHours' | 'bookingCount'
  order?: 'asc' | 'desc'
}

export const GroupStatInfoSchema = z.object({
  groupName: z.string(),
  groupType: z.string(),
  usageValue: z.number(),
  bookingCount: z.number()
})

export type GroupStatInfo = z.infer<typeof GroupStatInfoSchema>

export const TypeDistributionInfoSchema = z.object({
  type: z.string(),
  count: z.number(),
  percentage: z.number()
})

export const GroupStatisticsSummaryResponseSchema = z.object({
  activeGroups: KpiWithGrowthSchema,
  totalHours: KpiWithGrowthSchema,
  typeDistribution: z.array(TypeDistributionInfoSchema),
  occupancyRate: KpiWithGrowthSchema,
  mostUsedGroup: GroupStatInfoSchema,
  peakShift: z.object({
    shiftName: z.string(),
    usageRate: z.number().optional()
  })
})

export type GroupStatisticsSummaryResponse = z.infer<typeof GroupStatisticsSummaryResponseSchema>

export const GroupUsageShiftStatSchema = z.object({
  slotName: z.string(),
  distribution: z.record(z.string(), z.number())
})

export type GroupUsageShiftStat = z.infer<typeof GroupUsageShiftStatSchema>

export const GroupUsageDetailResponseSchema = z.object({
  groupId: z.number(),
  groupName: z.string(),
  groupType: z.string(),
  lecturerName: z.string(),
  mostUsedRoom: z.string(),
  mostUsedShift: z.string(),
  totalHours: z.number(),
  bookingCount: z.number()
})

export type GroupUsageDetailResponse = z.infer<typeof GroupUsageDetailResponseSchema>
