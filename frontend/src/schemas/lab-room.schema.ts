import { z } from 'zod'
import { LabRoomDeviceResponseSchema } from './lab-room-device.schema'

export const LabRoomDeviceRequestSchema = z.object({
  deviceId: z.number().positive('ID thiết bị là bắt buộc'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0')
})

export type LabRoomDeviceRequest = z.infer<typeof LabRoomDeviceRequestSchema>

export const LabRoomRequestSchema = z.object({
  roomName: z.string().min(1, 'Tên phòng là bắt buộc'),
  building: z.string().optional(),
  capacity: z.number().positive('Sức chứa phải lớn hơn 0'),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  devices: z.array(LabRoomDeviceRequestSchema).optional()
})

export type LabRoomRequest = z.infer<typeof LabRoomRequestSchema>

export const LabRoomResponseSchema = z.object({
  labRoomId: z.number(),
  roomName: z.string(),
  building: z.string(),
  capacity: z.number(),
  longitude: z.number(),
  latitude: z.number(),
  devices: z.array(LabRoomDeviceResponseSchema)
})

export type LabRoomResponse = z.infer<typeof LabRoomResponseSchema>

export const SecureLabRoomResponseSchema = LabRoomResponseSchema.extend({
  createdAt: z.string(),
  createdBy: z.string(),
  modifiedAt: z.string(),
  modifiedBy: z.string(),
  active: z.boolean()
})

export type SecureLabRoomResponse = z.infer<typeof SecureLabRoomResponseSchema>

export const FindLabRoomsParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  keyword: z.string().optional(),
  active: z.boolean().optional()
})

export type FindLabRoomsParams = z.infer<typeof FindLabRoomsParamsSchema>
