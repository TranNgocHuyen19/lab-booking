import { z } from 'zod'
import { PageResponseSchema } from './base.schema'

export const NotificationTypeSchema = z.enum([
  'BOOKING_CREATED',
  'BOOKING_APPROVED',
  'BOOKING_REJECTED',
  'BOOKING_CANCELED',
  'BOOKING_CANCELLED_BY_THESIS',
  'PARTICIPANT_CONFLICT_REQUIRED',
  'PARTICIPANT_CONFLICT_RESOLVED',
  'THESIS_PARTICIPANT_ADDED'
])

export const NotificationResponseSchema = z.object({
  notificationId: z.number(),
  type: NotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  relatedBookingRequestId: z.number().nullable().optional(),
  relatedParticipantId: z.number().nullable().optional(),
  relatedUserId: z.number().nullable().optional(),
  metadata: z.string().nullable().optional(),
  read: z.boolean(),
  createdAt: z.string(),
  readAt: z.string().nullable().optional()
})

export const UnreadNotificationCountResponseSchema = z.object({
  unreadCount: z.number()
})

export const PaginatedNotificationResponseSchema = PageResponseSchema(z.array(NotificationResponseSchema))

export type NotificationType = z.infer<typeof NotificationTypeSchema>
export type NotificationResponse = z.infer<typeof NotificationResponseSchema>
export type UnreadNotificationCountResponse = z.infer<typeof UnreadNotificationCountResponseSchema>
export type PaginatedNotificationResponse = z.infer<typeof PaginatedNotificationResponseSchema>
