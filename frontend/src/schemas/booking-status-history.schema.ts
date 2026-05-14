import { z } from 'zod'
import { RequestStatus, StatusChangeReason } from '@/constants/types'

const RequestStatusValues = Object.values(RequestStatus) as [string, ...string[]]
const StatusChangeReasonValues = Object.values(StatusChangeReason) as [string, ...string[]]

export const UserSummarySchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: z.string().nullable().optional()
})

export const BookingStatusHistoryResponseSchema = z.object({
  id: z.number(),
  fromStatus: z.enum(RequestStatusValues).nullable(),
  toStatus: z.enum(RequestStatusValues),
  changeReason: z.enum(StatusChangeReasonValues),
  note: z.string().nullable().optional(),
  relatedBookingRequestId: z.number().nullable().optional(),
  createdAt: z.string(),
  createdBy: UserSummarySchema.nullable().optional()
})

export type BookingStatusHistoryResponse = z.infer<typeof BookingStatusHistoryResponseSchema>
