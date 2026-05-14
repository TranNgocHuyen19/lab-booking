import { z } from 'zod'
import { DeviceResponseSchema } from '@/schemas/device.schema'

export const LabRoomDeviceResponseSchema = z.object({
  device: DeviceResponseSchema,
  quantity: z.number()
})

export type LabRoomDeviceResponse = z.infer<typeof LabRoomDeviceResponseSchema>
