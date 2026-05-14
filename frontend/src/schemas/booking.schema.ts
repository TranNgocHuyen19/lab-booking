import { z } from 'zod'
import { PageResponseSchema } from './base.schema'
import { UserSummaryResponseSchema } from '@/schemas/user.schema'

export const BookingTypeSchema = z.enum(['PERSONAL', 'GROUP', 'THESIS'])

export const ParticipantRoleSchema = z.enum([
  'SUPERVISOR',
  'PRESENTER',
  'COMMITTEE',
  'OBSERVER',
  'SELF_STUDY',
  'GROUP_STUDY'
])

export const AddParticipantRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: ParticipantRoleSchema
})

export const DeviceQuantityRequestSchema = z.object({
  deviceId: z.number(),
  quantity: z.number().min(1)
})

export const CreateBookingRequestSchema = z.object({
  labRoomId: z.number(),
  bookingDate: z.string(),
  slotIds: z.array(z.number()).min(1, 'Chọn ít nhất 1 ca'),
  bookingType: BookingTypeSchema,
  purpose: z.string().min(1, 'Vui lòng nhập mục đích').max(500),
  participants: z.array(AddParticipantRequestSchema).optional(),
  researchGroupIds: z.array(z.number()).optional(),
  devices: z.array(DeviceQuantityRequestSchema).optional(),
  force: z.boolean().optional()
})

export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>

export const RequestStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELED', 'SYSTEM_CANCELED'])
export const BookingParticipantResponseSchema = z.object({
  username: z.string(),
  fullName: z.string().optional(),
  role: ParticipantRoleSchema,
  status: z.string().optional()
})

export type BookingParticipantResponse = z.infer<typeof BookingParticipantResponseSchema>

export const BookingDeviceResponseSchema = z.object({
  deviceId: z.number(),
  deviceName: z.string(),
  deviceType: z.string(),
  icon: z.string().optional().nullable(),
  quantity: z.number()
})

export type BookingDeviceResponse = z.infer<typeof BookingDeviceResponseSchema>

export const BookingResponseSchema = z.object({
  bookingRequestId: z.number(),
  purpose: z.string(),
  bookingType: BookingTypeSchema,
  status: RequestStatusSchema,
  bookingDate: z.string(),
  labRoomId: z.number(),
  roomName: z.string(),
  building: z.string(),
  roomCapacity: z.number(),
  slots: z.array(
    z.object({
      slotId: z.number(),
      slotName: z.string(),
      startTime: z.string(),
      endTime: z.string()
    })
  ),
  participantCount: z.number(),
  devices: z.array(BookingDeviceResponseSchema).optional(),
  researchGroupIds: z.array(z.number()).optional(),
  requesterId: z.number(),
  requesterName: z.string(),
  requesterUsername: z.string().optional(),
  isCreator: z.boolean(),
  isAllowedEditing: z.boolean(),
  responseNote: z.string().optional().nullable(),
  responseDate: z.string().optional().nullable(),
  responseBy: UserSummaryResponseSchema.optional().nullable(),
  cancelReason: z.string().optional().nullable(),
  createdAt: z.string()
})

export type BookingResponse = z.infer<typeof BookingResponseSchema>

export const SecureBookingParticipantResponseSchema = z.object({
  participantId: z.number(),
  userId: z.number(),
  username: z.string(),
  fullName: z.string().optional(),
  role: ParticipantRoleSchema,
  status: z.string(),
  addedAt: z.string(),
  addedBy: z.string(),
  modifiedAt: z.string().optional().nullable(),
  modifiedBy: z.string().optional().nullable()
})

export const SecureBookingResponseSchema = z.object({
  bookingRequestId: z.number(),
  purpose: z.string(),
  bookingType: BookingTypeSchema,
  status: RequestStatusSchema,
  bookingDate: z.string(),
  labRoomId: z.number(),
  roomName: z.string(),
  building: z.string(),
  roomCapacity: z.number(),
  slots: z.array(
    z.object({
      slotId: z.number(),
      slotName: z.string(),
      startTime: z.string(),
      endTime: z.string()
    })
  ),
  participantCount: z.number(),
  devices: z.array(BookingDeviceResponseSchema).optional(),
  researchGroupIds: z.array(z.number()).optional(),
  requesterId: z.number(),
  requesterName: z.string(),
  requesterUsername: z.string().optional(),
  isCreator: z.boolean(),
  isAllowedEditing: z.boolean(),
  responseNote: z.string().optional().nullable(),
  responseDate: z.string().optional().nullable(),
  responseBy: UserSummaryResponseSchema.optional().nullable(),
  cancelReason: z.string().optional().nullable(),
  createdAt: z.string(),
  modifiedAt: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  modifiedBy: z.string().optional().nullable()
})

export type SecureBookingResponse = z.infer<typeof SecureBookingResponseSchema>

export const UpdateBookingRequestSchema = z.object({
  purpose: z.string().min(1, 'Vui lòng nhập mục đích').max(500),
  participants: z.array(AddParticipantRequestSchema).optional(),
  devices: z.array(DeviceQuantityRequestSchema).optional(),
  force: z.boolean().optional()
})

export type UpdateBookingRequest = z.infer<typeof UpdateBookingRequestSchema>

export const CancelBookingRequestSchema = z.object({
  cancelReason: z.string().max(500, 'Lý do hủy không quá 500 ký tự').optional()
})

export type CancelBookingRequest = z.infer<typeof CancelBookingRequestSchema>

export const BookingStatusRequestSchema = z.object({
  responseNote: z.string().max(500, 'Ghi chú không quá 500 ký tự').optional()
})

export type BookingStatusRequest = z.infer<typeof BookingStatusRequestSchema>

export const ParticipantDetailResponseSchema = z.object({
  username: z.string(),
  fullName: z.string(),
  role: ParticipantRoleSchema,
  checkinAt: z.string().nullable(),
  checkoutAt: z.string().nullable(),
  checkinStatus: z.string().nullable(),
  checkoutStatus: z.string().nullable(),
  lateCheckinMinutes: z.number().nullable(),
  earlyCheckoutMinutes: z.number().nullable(),
  lateCheckoutMinutes: z.number().nullable(),
  checkinNote: z.string().nullable().optional(),
  checkoutNote: z.string().nullable().optional()
})

export type ParticipantDetailResponse = z.infer<typeof ParticipantDetailResponseSchema>

export const PaginatedParticipantResponseSchema = PageResponseSchema(z.array(ParticipantDetailResponseSchema))

export type PaginatedParticipantResponse = z.infer<typeof PaginatedParticipantResponseSchema>

export const PaginatedBookingParticipantResponseSchema = PageResponseSchema(z.array(BookingParticipantResponseSchema))

export type PaginatedBookingParticipantResponse = z.infer<typeof PaginatedBookingParticipantResponseSchema>

export const PaginatedSecureBookingResponseSchema = PageResponseSchema(z.array(SecureBookingResponseSchema))

export type PaginatedSecureBookingResponse = z.infer<typeof PaginatedSecureBookingResponseSchema>

export const PendingBookingResponseSchema = z.object({
  id: z.number(),
  room: z.string(),
  slot: z
    .object({
      slotName: z.string(),
      startTime: z.string(),
      endTime: z.string()
    })
    .nullable(),
  bookingDate: z.string(),
  createdAt: z.string(),
  type: z.enum(['PERSONAL', 'GROUP', 'THESIS']),
  groupName: z.string().nullable().optional(),
  requester: UserSummaryResponseSchema
})

export type PendingBookingResponse = z.infer<typeof PendingBookingResponseSchema>

export const SlotBookingDetailDeviceSchema = z.object({
  deviceId: z.number(),
  deviceName: z.string(),
  deviceType: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  quantity: z.number()
})

export type SlotBookingDetailDevice = z.infer<typeof SlotBookingDetailDeviceSchema>

export const SlotBookingDetailItemSchema = z.object({
  bookingRequestId: z.number(),
  purpose: z.string(),
  bookingType: BookingTypeSchema,
  status: RequestStatusSchema,
  requesterId: z.number(),
  requesterName: z.string(),
  requesterUsername: z.string().optional().nullable(),
  groupName: z.string().optional().nullable(),
  leaderName: z.string().optional().nullable(),
  leaderUsername: z.string().optional().nullable(),
  participantCount: z.number(),
  devices: z.array(SlotBookingDetailDeviceSchema).optional().nullable(),
  responseNote: z.string().optional().nullable(),
  responseDate: z.string().optional().nullable(),
  cancelReason: z.string().optional().nullable(),
  createdAt: z.string()
})

export type SlotBookingDetailItem = z.infer<typeof SlotBookingDetailItemSchema>

export const SlotBookingDetailParticipantSchema = z.object({
  participantId: z.number(),
  userId: z.number(),
  username: z.string(),
  fullName: z.string().optional(),
  role: ParticipantRoleSchema,
  memberRole: z.string().optional().nullable()
})

export type SlotBookingDetailParticipant = z.infer<typeof SlotBookingDetailParticipantSchema>

export const SlotBookingDetailResponseSchema = z.object({
  labRoomId: z.number(),
  roomName: z.string(),
  building: z.string(),
  roomCapacity: z.number(),
  slotId: z.number(),
  slotName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  bookingDate: z.string(),
  bookings: z.array(SlotBookingDetailItemSchema),
  totalApproved: z.number(),
  totalPending: z.number(),
  totalOccupants: z.number(),
  availableSeats: z.number()
})

export type SlotBookingDetailResponse = z.infer<typeof SlotBookingDetailResponseSchema>
