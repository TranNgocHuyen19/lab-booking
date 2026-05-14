import { z } from 'zod'

export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  role: z.string().optional()
})

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>

export const resetPasswordRequestSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    resetToken: z.string(),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>
