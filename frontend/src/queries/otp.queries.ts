import { createMutation } from '@/query-core'
import otpService from '@/services/otp.service'

export const useSendOtpMutation = () => {
  return createMutation({
    mutationFn: otpService.send
  })()
}

export const useVerifyOtpMutation = () => {
  return createMutation({
    mutationFn: otpService.verify
  })()
}
