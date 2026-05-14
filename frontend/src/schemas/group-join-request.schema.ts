import { z } from 'zod'
import { RequestStatus } from '@/constants/types'
import { userBriefInfoSchema, lecturerBriefInfoSchema } from './user.schema'

export const createJoinRequestSchema = z.object({
  researchGroupId: z.number().positive('Research group ID is required'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional()
})

export const updateJoinRequestStatusSchema = z.object({
  responseNote: z.string().max(500, 'Response message must be less than 500 characters').optional()
})

export const groupJoinRequestResponseSchema = z.object({
  requestId: z.number(),
  userId: z.number(),
  username: z.string(),
  fullName: z.string(),
  researchGroupId: z.number(),
  groupName: z.string(),
  status: z.string(),
  message: z.string().nullable(),
  responseDate: z.string().nullable(),
  createdAt: z.string()
})

export const secureGroupJoinRequestResponseSchema = z.object({
  requestId: z.number(),
  userId: z.number(),
  username: z.string(),
  fullName: z.string(),
  researchGroupId: z.number(),
  groupName: z.string(),
  status: z.nativeEnum(RequestStatus),
  message: z.string().nullable(),
  responseNote: z.string().nullable(),
  responseDate: z.string().nullable(),
  responseByName: z.string().nullable(),
  leaderName: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable()
})

export const groupJoinRequestDetailResponseSchema = z.object({
  requestId: z.number(),
  user: userBriefInfoSchema,
  researchGroupId: z.number(),
  groupName: z.string(),
  projectName: z.string().nullable().optional(),
  status: z.string(),
  message: z.string().nullable(),
  responseNote: z.string().nullable(),
  responseBy: lecturerBriefInfoSchema.nullable(),
  responseDate: z.string().nullable(),
  createdAt: z.string()
})

export type CreateJoinRequestRequest = z.infer<typeof createJoinRequestSchema>
export type UpdateJoinRequestStatusRequest = z.infer<typeof updateJoinRequestStatusSchema>
export type GroupJoinRequestResponse = z.infer<typeof groupJoinRequestResponseSchema>
export type SecureGroupJoinRequestResponse = z.infer<typeof secureGroupJoinRequestResponseSchema>
export type GroupJoinRequestDetailResponse = z.infer<typeof groupJoinRequestDetailResponseSchema>
