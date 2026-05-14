import { z } from 'zod'
import { LabRoomDeviceResponseSchema } from '@/schemas/lab-room-device.schema'

export const SlotScheduleResponseSchema = z.object({
  slotId: z.number(),
  slotName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.string(),
  bookingRequestIds: z.array(z.number()),
  participantCount: z.number(),
  roomCapacity: z.number(),
  pendingCount: z.number().optional()
})

export const DayScheduleResponseSchema = z.object({
  date: z.string(),
  slots: z.array(SlotScheduleResponseSchema)
})

export const RoomScheduleResponseSchema = z.object({
  labRoomId: z.number(),
  roomName: z.string(),
  building: z.string(),
  capacity: z.number(),
  devices: z.array(LabRoomDeviceResponseSchema),
  schedule: z.array(DayScheduleResponseSchema)
})

export const WeekScheduleResponseSchema = z.object({
  weekStart: z.string(),
  weekEnd: z.string(),
  rooms: z.array(RoomScheduleResponseSchema)
})

export type SlotScheduleResponse = z.infer<typeof SlotScheduleResponseSchema>
export type DayScheduleResponse = z.infer<typeof DayScheduleResponseSchema>
export type RoomScheduleResponse = z.infer<typeof RoomScheduleResponseSchema>
export type WeekScheduleResponse = z.infer<typeof WeekScheduleResponseSchema>

export const FindWeekScheduleParamsSchema = z.object({
  date: z.string()
})

export type FindWeekScheduleParams = z.infer<typeof FindWeekScheduleParamsSchema>
