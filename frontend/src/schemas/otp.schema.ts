import { z } from 'zod'

export const sendOtpRequestSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  scope: z.string(),
  name: z.string().optional()
})

export type SendOtpRequest = z.infer<typeof sendOtpRequestSchema>

export const verifyOtpRequestSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  scope: z.string().optional(),
  otp: z.string().min(6, 'Vui lòng nhập đủ 6 số')
})

export type VerifyOtpRequest = z.infer<typeof verifyOtpRequestSchema>

export const verifyOtpResponseSchema = z.object({
  resetToken: z.string(),
  expiresInMinutes: z.number().optional()
})

export type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>

export const sendOtpResponseSchema = z.object({
  message: z.string().optional(),
  cooldownSeconds: z.number().optional(),
  expiresInMinutes: z.number().optional()
})

export type SendOtpResponse = z.infer<typeof sendOtpResponseSchema>
