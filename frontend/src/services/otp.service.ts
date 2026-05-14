import http from '@/lib/http'
import type { SendOtpRequest, SendOtpResponse, VerifyOtpRequest, VerifyOtpResponse } from '@/schemas/otp.schema'
import type { ApiResponse } from '@/schemas/base.schema'

const otpService = {
  send: (body: SendOtpRequest) => http.post<ApiResponse<SendOtpResponse>>('/otp/send', body),

  verify: (body: VerifyOtpRequest) => http.post<ApiResponse<VerifyOtpResponse>>('/otp/verify', body),

  getCooldown: (email: string, scope: string) =>
    http.get<ApiResponse<number>>(`/otp/cooldown?email=${email}&scope=${scope}`)
}

export default otpService
