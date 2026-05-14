import { useQueryClient } from '@tanstack/react-query'
import { createMutation } from '@/query-core'
import passwordService from '@/services/password.service'

export const useChangePasswordMutation = () => {
  return createMutation({
    mutationFn: passwordService.change
  })()
}

export const useForgotPasswordMutation = () => {
  return createMutation({
    mutationFn: passwordService.forgot
  })()
}

export const useResetPasswordMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: passwordService.reset,
    onSuccess: () => {
      queryClient.clear()
    }
  })()
}
