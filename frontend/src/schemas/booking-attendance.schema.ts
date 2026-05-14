import { CheckinStatus, CheckoutStatus } from '@/constants/types'
import { z } from 'zod'

export const CheckInRequestSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  note: z.string().max(500).optional()
})

export type CheckInRequest = z.infer<typeof CheckInRequestSchema>

export const CheckOutRequestSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  note: z.string().max(500).optional()
})

export type CheckOutRequest = z.infer<typeof CheckOutRequestSchema>

export const AttendanceStatusResponseSchema = z.object({
  hasCheckedIn: z.boolean(),
  hasCheckedOut: z.boolean(),
  canCheckIn: z.boolean(),
  canCheckOut: z.boolean(),

  calculatedCheckinStatus: z.nativeEnum(CheckinStatus).nullable(),
  calculatedLateCheckinMinutes: z.number().optional().nullable(),
  needNoteForCheckIn: z.boolean(),
  calculatedCheckoutStatus: z.nativeEnum(CheckoutStatus).nullable(),
  calculatedEarlyCheckoutMinutes: z.number().optional().nullable(),
  calculatedLateCheckoutMinutes: z.number().optional().nullable(),
  needNoteForCheckOut: z.boolean(),

  checkinAt: z.string().nullable().optional(),
  checkoutAt: z.string().nullable().optional(),
  actualLateCheckinMinutes: z.number().nullable().optional(),
  actualEarlyCheckoutMinutes: z.number().nullable().optional(),
  actualLateCheckoutMinutes: z.number().nullable().optional(),
  checkinNote: z.string().nullable().optional(),
  checkoutNote: z.string().nullable().optional()
})

export type AttendanceStatusResponse = z.infer<typeof AttendanceStatusResponseSchema>

export const AttendanceResponseSchema = z.object({
  attendanceId: z.number(),
  userName: z.string().optional(),
  userFullName: z.string().optional(),
  checkinStatus: z.nativeEnum(CheckinStatus).nullable(),
  lateCheckinMinutes: z.number().nullable().optional(),
  checkinNote: z.string().nullable().optional(),
  checkinAt: z.string().nullable(),
  checkoutStatus: z.nativeEnum(CheckoutStatus).nullable(),
  earlyCheckoutMinutes: z.number().nullable().optional(),
  lateCheckoutMinutes: z.number().nullable().optional(),
  checkoutNote: z.string().nullable().optional(),
  checkoutAt: z.string().nullable()
})

export type AttendanceResponse = z.infer<typeof AttendanceResponseSchema>
