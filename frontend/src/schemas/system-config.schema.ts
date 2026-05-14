import { z } from 'zod'

// Attendance Configuration
export const AttendanceSystemConfigResponseSchema = z.object({
  attendanceSystemConfigId: z.number(),
  earlyCheckinMinutes: z.number(),
  lateCheckinMinutes: z.number(),
  earlyCheckoutMinutes: z.number(),
  lateCheckoutMinutes: z.number(),
  labRadiusMeters: z.number(),
  createdAt: z.string().nullable(),
  createdBy: z.string().nullable(),
  modifiedAt: z.string().nullable(),
  modifiedBy: z.string().nullable(),
  active: z.boolean()
})

export type AttendanceSystemConfigResponse = z.infer<typeof AttendanceSystemConfigResponseSchema>

export const UpdateAttendanceSystemConfigRequestSchema = z.object({
  earlyCheckinMinutes: z.number().min(0).max(60).optional(),
  lateCheckinMinutes: z.number().min(0).max(60).optional(),
  earlyCheckoutMinutes: z.number().min(0).max(60).optional(),
  lateCheckoutMinutes: z.number().min(0).max(60).optional(),
  labRadiusMeters: z.number().min(0).max(1000).optional(),
  reason: z.string().optional()
})

export type UpdateAttendanceSystemConfigRequest = z.infer<typeof UpdateAttendanceSystemConfigRequestSchema>

// Booking Configuration
export const BookingSystemConfigResponseSchema = z.object({
  bookingSystemConfigId: z.number(),
  studentAdvanceDays: z.number(),
  lecturerAdvanceDays: z.number(),
  adminAdvanceDays: z.number(),
  minMinutesBeforeStartToCancel: z.number(),
  minMinutesBeforeStartToApprove: z.number(),
  studentMinMinutesToBook: z.number(),
  lecturerMinMinutesToBook: z.number(),
  createdAt: z.string().nullable(),
  createdBy: z.string().nullable(),
  modifiedAt: z.string().nullable(),
  modifiedBy: z.string().nullable(),
  active: z.boolean()
})

export type BookingSystemConfigResponse = z.infer<typeof BookingSystemConfigResponseSchema>

export const UpdateBookingSystemConfigRequestSchema = z.object({
  studentAdvanceDays: z.number().min(1).max(365).optional(),
  lecturerAdvanceDays: z.number().min(1).max(365).optional(),
  adminAdvanceDays: z.number().min(1).max(365).optional(),
  minMinutesBeforeStartToCancel: z.number().min(0).max(1440).optional(),
  minMinutesBeforeStartToApprove: z.number().min(-1440).max(1440).optional(),
  studentMinMinutesToBook: z.number().min(-1440).max(1440).optional(),
  lecturerMinMinutesToBook: z.number().min(-1440).max(1440).optional(),
  reason: z.string().optional()
})

export type UpdateBookingSystemConfigRequest = z.infer<typeof UpdateBookingSystemConfigRequestSchema>

export const UpdateConfigFieldRequestSchema = z.object({
  value: z.number(),
  reason: z.string().optional()
})

export type UpdateConfigFieldRequest = z.infer<typeof UpdateConfigFieldRequestSchema>

// Config History
export const SystemConfigHistoryResponseSchema = z.object({
  systemConfigHistoryId: z.number(),
  configKey: z.string(),
  configName: z.string().nullable(),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  changedBy: z.string().nullable(),
  changedAt: z.string().nullable(),
  reason: z.string().nullable(),
  category: z.string().nullable()
})

export type SystemConfigHistoryResponse = z.infer<typeof SystemConfigHistoryResponseSchema>
