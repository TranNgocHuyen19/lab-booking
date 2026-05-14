import { z } from 'zod'

export const slotSchema = z
  .object({
    slotName: z.string().min(1, 'Tên ca không được để trống'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:mm)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Định dạng giờ không hợp lệ (HH:mm)'),
    description: z.string().optional(),
    active: z.boolean().optional()
  })
  .refine(
    (data) => {
      const [startHour, startMinute] = data.startTime.split(':').map(Number)
      const [endHour, endMinute] = data.endTime.split(':').map(Number)

      const start = startHour * 60 + startMinute
      const end = endHour * 60 + endMinute

      return end > start
    },
    {
      message: 'Giờ kết thúc phải sau giờ bắt đầu',
      path: ['endTime']
    }
  )

export type SlotRequest = z.infer<typeof slotSchema>

export interface SlotResponse {
  slotId: number
  slotName: string
  startTime: string
  endTime: string
  description?: string
}

export interface SecureSlotResponse extends SlotResponse {
  active?: boolean
  createdAt?: string
  modifiedAt?: string
  createdBy?: string
  modifiedBy?: string
}
