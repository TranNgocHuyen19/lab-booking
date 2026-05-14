import { z } from 'zod'
import { BookingType, RequestStatus } from '@/constants/types'

export const LabBookingKpiParamsSchema = z.object({
  startDate: z.string(),
  endDate: z.string()
})

export type LabBookingKpiParams = z.infer<typeof LabBookingKpiParamsSchema>

export const AuditLogParamsSchema = LabBookingKpiParamsSchema.extend({
  status: z.nativeEnum(RequestStatus).optional(),
  adminId: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional()
})

export type AuditLogParams = z.infer<typeof AuditLogParamsSchema>

export interface LabBookingKpiResponse {
  pendingCount: number
  avgProcessingSpeedMinutes: number
  approvalRate: number
  conflictRate: number
}

export interface BookingOutcomeResponse {
  status: keyof typeof RequestStatus
  count: number
  percentage: number
}

export interface SubmissionTrendResponse {
  hour: number
  count: number
}

export interface BookingAuditLogResponse {
  bookingId: number
  requesterName: string
  requesterMssv: string
  requesterAvatar?: string
  bookingType: keyof typeof BookingType
  submitTime: string
  processTime?: string
  processingTimeMinutes?: number
  status: keyof typeof RequestStatus
}
