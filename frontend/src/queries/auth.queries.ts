import { createMutation } from '@/query-core'
import authService from '@/services/auth.service'

export const useStudentLoginMutation = () => {
  return createMutation({
    mutationFn: authService.studentLogin
  })()
}

export const useLecturerLoginMutation = () => {
  return createMutation({
    mutationFn: authService.lecturerLogin
  })()
}

export const useRegisterMutation = () => {
  return createMutation({
    mutationFn: authService.register
  })()
}

export const useLogoutMutation = () => {
  return createMutation({
    mutationFn: authService.logout
  })()
}

export const useLogoutAllMutation = () => {
  return createMutation({
    mutationFn: authService.logoutAll
  })()
}
