import { z } from 'zod'

export const LecturerKpiSchema = z.object({
  pendingJoinRequests: z.number(),
  weeklySchedules: z.number(),
  guidingGroups: z.number(),
  totalStudents: z.number()
})

export const UpcomingAgendaSchema = z.object({
  bookingId: z.number(),
  roomName: z.string(),
  slotName: z.string(),
  slotTime: z.string(),
  groupName: z.string(),
  bookingType: z.string(),
  bookingDate: z.string(),
  status: z.string()
})

export const QuickJoinRequestSchema = z.object({
  requestId: z.number(),
  studentName: z.string(),
  studentCode: z.string(),
  studentAvatar: z.string().nullable(),
  groupName: z.string(),
  createdAt: z.string()
})

export const LecturerDashboardSchema = z.object({
  kpis: LecturerKpiSchema,
  upcomingAgenda: z.array(UpcomingAgendaSchema),
  quickJoinRequests: z.array(QuickJoinRequestSchema)
})

export type LecturerKpiResponse = z.infer<typeof LecturerKpiSchema>
export type UpcomingAgendaResponse = z.infer<typeof UpcomingAgendaSchema>
export type QuickJoinRequestResponse = z.infer<typeof QuickJoinRequestSchema>
export type LecturerDashboardResponse = z.infer<typeof LecturerDashboardSchema>
