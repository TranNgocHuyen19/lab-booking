import z from 'zod'

export const researchGroupResponseSchema = z.object({
  researchGroupId: z.number(),
  groupName: z.string(),
  description: z.string().nullable(),
  groupType: z.string(),
  projectName: z.string().nullable(),
  leaderName: z.string().nullable().optional(),
  isPrivate: z.boolean(),
  status: z.string().optional(),
  memberCount: z.number().optional(),
  requestStatus: z.string().nullable().optional(),
  memberRole: z.string().nullable().optional(),
  requestId: z.number().nullable().optional()
})

export const otherResearchGroupResponseSchema = researchGroupResponseSchema.extend({
  requestStatus: z.string().nullable().optional()
})

export const memberInfoSchema = z.object({
  userId: z.number(),
  username: z.string(),
  fullName: z.string(),
  role: z.string()
})

export const groupJoinRequestSchema = z.object({
  requestId: z.number(),
  userId: z.number(),
  username: z.string(),
  fullName: z.string(),
  researchGroupId: z.number(),
  groupName: z.string(),
  status: z.string(),
  message: z.string().nullable().optional(),
  createdAt: z.string()
})

export const myResearchGroupResponseSchema = researchGroupResponseSchema.extend({
  memberRole: z.string().nullable().optional(),
  leaders: z.array(memberInfoSchema).optional(),
  members: z.array(memberInfoSchema).optional()
})

export const secureResearchGroupResponseSchema = z.object({
  researchGroupId: z.number(),
  groupName: z.string(),
  description: z.string().nullable(),
  projectName: z.string().nullable(),
  groupType: z.string(),
  status: z.string().nullable(),
  isPrivate: z.boolean(),
  leaderId: z.number().nullable().optional(),
  leaderName: z.string().nullable().optional(),
  members: z.array(memberInfoSchema).nullable().optional(),
  createdAt: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  modifiedAt: z.string().nullable().optional(),
  modifiedBy: z.string().nullable().optional(),
  active: z.boolean(),
  pendingRequestsCount: z.number().optional().default(0)
})

export type ResearchGroupResponse = z.infer<typeof researchGroupResponseSchema>
export type OtherResearchGroupResponse = ResearchGroupResponse
export type MyResearchGroupResponse = z.infer<typeof myResearchGroupResponseSchema>
export type MemberInfoResponse = z.infer<typeof memberInfoSchema>
export type GroupJoinRequestResponse = z.infer<typeof groupJoinRequestSchema>
export type SecureResearchGroupResponse = z.infer<typeof secureResearchGroupResponseSchema>

export const createResearchGroupSchema = z.object({
  groupName: z.string().min(1, 'Tên nhóm không được để trống').max(100, 'Tên nhóm không quá 100 ký tự'),
  description: z.string().max(500, 'Mô tả không quá 500 ký tự').optional(),
  projectName: z.string().max(200, 'Tên đề tài không quá 200 ký tự').optional(),
  groupType: z.string().min(1, 'Loại nhóm không được để trống'),
  isPrivate: z.boolean(),
  initialMembers: z
    .array(
      z.object({
        username: z.string().min(1, 'MSSV/MSNV không được để trống'),
        role: z.string()
      })
    )
    .optional(),
  advisorId: z.number().optional()
})

export const updateResearchGroupSchema = z.object({
  groupName: z.string().min(1, 'Tên nhóm không được để trống').max(100, 'Tên nhóm không quá 100 ký tự').optional(),
  description: z.string().max(500, 'Mô tả không quá 500 ký tự').optional(),
  projectName: z.string().max(200, 'Tên đề tài không quá 200 ký tự').optional(),
  groupType: z.string().min(1, 'Loại nhóm không được để trống').optional(),
  isPrivate: z.boolean().optional(),
  advisorId: z.number().optional(),
  members: z
    .array(
      z.object({
        username: z.string().min(1, 'MSSV/MSNV không được để trống'),
        role: z.string()
      })
    )
    .optional()
})

export type CreateResearchGroupRequest = z.infer<typeof createResearchGroupSchema>
export type UpdateResearchGroupRequest = z.infer<typeof updateResearchGroupSchema>
