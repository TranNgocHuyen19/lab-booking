import { z } from 'zod'

export const DeviceRequestSchema = z.object({
  deviceName: z.string().min(1, 'Tên thiết bị là bắt buộc'),
  deviceType: z.string().optional(),
  icon: z.string().optional(),
  active: z.boolean().optional()
})

export type DeviceRequest = z.infer<typeof DeviceRequestSchema>

export const DeviceResponseSchema = z.object({
  deviceId: z.number(),
  deviceName: z.string(),
  deviceType: z.string(),
  icon: z.string().nullable()
})

export type DeviceResponse = z.infer<typeof DeviceResponseSchema>

export const SecuredDeviceResponseSchema = DeviceResponseSchema.extend({
  createdAt: z.string(),
  createdBy: z.string(),
  modifiedAt: z.string(),
  modifiedBy: z.string(),
  active: z.boolean(),
  totalQuantity: z.number().optional(),
  roomAllocations: z
    .array(
      z.object({
        labRoomId: z.number(),
        labRoomName: z.string(),
        quantity: z.number()
      })
    )
    .optional()
})

export type SecuredDeviceResponse = z.infer<typeof SecuredDeviceResponseSchema>

export interface FindDevicesParams {
  page?: number
  limit?: number
  keyword?: string
  active?: boolean | null
}

export interface DeviceAvailabilityParams {
  labRoomId: number
  date: string
  slotIds: number[]
  excludeBookingId?: number
}

export interface DeviceAvailabilityResponse {
  deviceId: number
  deviceName: string
  deviceType: string
  icon: string | null
  totalQuantity: number
  availableQuantity: number
}
