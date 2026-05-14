import { z } from 'zod'

export const loginRequestSchema = z.object({
  username: z.string().min(1, 'Mã số sinh viên là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc')
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  username: z.string(),
  fullName: z.string(),
  role: z.string()
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const registerRequestSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Mã số sinh viên phải có ít nhất 3 ký tự')
      .max(50, 'Mã số sinh viên không quá 50 ký tự'),
    fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100, 'Họ tên không quá 100 ký tự'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
    dob: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val) return true
          const date = new Date(val)
          const now = new Date()
          date.setHours(0, 0, 0, 0)
          now.setHours(0, 0, 0, 0)
          return date < now
        },
        { message: 'Ngày sinh phải trước ngày hiện tại' }
      ),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 số')
      .or(z.literal(''))
      .optional()
      .nullable(),
    iuhEmail: z
      .string()
      .min(1, 'Email IUH là bắt buộc')
      .email('Email IUH không hợp lệ')
      .max(100)
      .refine((email) => email.endsWith('@student.iuh.edu.vn'), {
        message: 'Email phải có đuôi @student.iuh.edu.vn'
      }),
    personalEmail: z.string().email('Email cá nhân không hợp lệ').max(100).or(z.literal('')).optional().nullable(),
    department: z.string().max(100).or(z.literal('')).optional().nullable(),
    faculty: z.string().max(100).or(z.literal('')).optional().nullable(),
    grade: z.string().min(1, 'Vui lòng nhập tên lớp'),
    frontStudentCard: z.union([z.number(), z.string()]).refine((val) => !!val, {
      message: 'Vui lòng tải lên mặt trước thẻ sinh viên'
    }),
    backStudentCard: z.union([z.number(), z.string()]).refine((val) => !!val, {
      message: 'Vui lòng tải lên mặt sau thẻ sinh viên'
    }),
    researchGroupIds: z.array(z.number()).optional().nullable(),
    joinMessage: z.string().optional().nullable()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export type RegisterRequest = z.infer<typeof registerRequestSchema>

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string()
})

export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  username: z.string(),
  fullName: z.string(),
  role: z.string()
})

export type TokenResponse = z.infer<typeof tokenResponseSchema>

export const logoutRequestSchema = z.object({
  refreshToken: z.string().optional().nullable()
})

export type LogoutRequest = z.infer<typeof logoutRequestSchema>
