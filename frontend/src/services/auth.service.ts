import http from '@/lib/http'
import type { LoginRequest, LoginResponse, RegisterRequest, TokenResponse } from '@/schemas/auth.schema'
import type { ApiResponse } from '@/schemas/base.schema'

const authService = {
  studentLogin: (body: LoginRequest) => http.post<ApiResponse<LoginResponse>>('/auth/student/login', body),

  lecturerLogin: (body: LoginRequest) => http.post<ApiResponse<LoginResponse>>('/auth/lecturer/login', body),

  register: (body: RegisterRequest) => http.post<ApiResponse<LoginResponse>>('/auth/register', body),

  refreshToken: () => http.post<ApiResponse<TokenResponse>>('/auth/refresh-token', {}),

  logout: () => http.post<ApiResponse<void>>('/auth/logout', {}),

  logoutAll: () => http.post<ApiResponse<void>>('/auth/logout-all', {})
}

export default authService
