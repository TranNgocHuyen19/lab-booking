import { z } from 'zod'
import { researchGroupResponseSchema } from '@/schemas/research-group.schema'

export const userResponseSchema = z.object({
  userId: z.number(),
  username: z.string(),
  fullName: z.string(),
  iuhEmail: z.string(),
  dob: z.string().nullable(),
  phone: z.string().nullable(),
  personalEmail: z.string().nullable(),
  active: z.boolean(),
  role: z.string(),
  department: z.string().nullable(),
  faculty: z.string().nullable(),
  studentId: z.string().nullable(),
  grade: z.string().nullable(),
  lecturerId: z.string().nullable(),
  joinedGroups: z.array(researchGroupResponseSchema).optional()
})

export type UserResponse = z.infer<typeof userResponseSchema>

export const secureUserResponseSchema = userResponseSchema.extend({
  createdAt: z.string(),
  createdBy: z.string().nullable(),
  modifiedAt: z.string(),
  modifiedBy: z.string().nullable()
})

export type SecureUserResponse = z.infer<typeof secureUserResponseSchema>

export const userBriefInfoSchema = z.object({
  username: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  iuhEmail: z.string(),
  faculty: z.string().nullable(),
  department: z.string().nullable(),
  grade: z.string().nullable()
})

export type UserBriefInfoResponse = z.infer<typeof userBriefInfoSchema>

export const lecturerBriefInfoSchema = z.object({
  userId: z.number(),
  username: z.string(),
  fullName: z.string(),
  phone: z.string().nullable(),
  iuhEmail: z.string(),
  faculty: z.string().nullable(),
  department: z.string().nullable(),
  lecturerId: z.string().nullable()
})

export type LecturerBriefInfoResponse = z.infer<typeof lecturerBriefInfoSchema>

export const updateUserRequestSchema = z.object({
  dob: z.string().min(1, 'Ngày sinh không được để trống'),
  phone: z
    .string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số'),
  personalEmail: z.string().min(1, 'Email cá nhân không được để trống').email('Địa chỉ email không hợp lệ'),
  department: z.string().min(1, 'Ngành không được để trống'),
  faculty: z.string().min(1, 'Khoa không được để trống'),
  grade: z.string().min(1, 'Lớp không được để trống')
})

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>

export const createUserRequestSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập ít nhất 3 ký tự').max(50),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  fullName: z.string().min(1, 'Họ tên không được để trống').max(100),
  dob: z.string().optional(),
  phone: z.string().optional(),
  iuhEmail: z.string().email('Email IUH không hợp lệ').optional(),
  personalEmail: z.string().email('Email cá nhân không hợp lệ').optional(),
  department: z.string().max(100).optional(),
  faculty: z.string().max(100).optional(),
  role: z.string().min(1, 'Vai trò không được để trống'),
  studentId: z.string().optional(),
  lecturerId: z.string().optional(),
  grade: z.string().optional()
})

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>

export const UserSummaryResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: z.string()
})

export type UserSummaryResponse = z.infer<typeof UserSummaryResponseSchema>
