import http from '@/lib/http'
import type { ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/schemas/password.schema'
import type { SendOtpResponse } from '@/schemas/otp.schema'
import type { ApiResponse } from '@/schemas/base.schema'

const passwordService = {
  change: (body: ChangePasswordRequest) => http.post<ApiResponse<void>>('/password/change', body),

  forgot: (body: ForgotPasswordRequest) => http.post<ApiResponse<SendOtpResponse>>('/password/forgot', body),

  reset: (body: ResetPasswordRequest) => http.post<ApiResponse<void>>('/password/reset', body)
}

export default passwordService
