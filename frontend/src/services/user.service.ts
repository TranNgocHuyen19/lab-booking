import http from '@/lib/http'
import type { UserResponse, UpdateUserRequest, CreateUserRequest, SecureUserResponse } from '@/schemas/user.schema'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'

export const userService = {
  me: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await http.get<ApiResponse<UserResponse>>('/users/me')
    return response.data
  },

  updateProfile: async (body: UpdateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await http.put<ApiResponse<UserResponse>>('/users/me', body)
    return response.data
  },

  updateUserAdmin: async (username: string, body: UpdateUserRequest): Promise<ApiResponse<SecureUserResponse>> => {
    const response = await http.put<ApiResponse<SecureUserResponse>>(`/users/${username}`, body)
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await http.get<ApiResponse<UserResponse>>(`/users/${id}`)
    return response.data
  },

  searchUsers: async (params: {
    keyword?: string
    role?: string
    page?: number
    size?: number
  }): Promise<UserResponse[]> => {
    const response = await http.get<ApiResponse<PageResponse<UserResponse[]>>>('/users/search', {
      params
    })
    return response.data.data?.data || []
  },

  filterUsersAdmin: async (params: {
    keyword?: string
    role?: string
    active?: boolean
    page?: number
    size?: number
  }): Promise<ApiResponse<PageResponse<SecureUserResponse[]>>> => {
    const response = await http.get<ApiResponse<PageResponse<SecureUserResponse[]>>>('/users/admin', {
      params
    })
    return response.data
  },

  createUser: async (body: CreateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await http.post<ApiResponse<UserResponse>>('/users', body)
    return response.data
  },

  updateActive: async (username: string, active: boolean): Promise<ApiResponse<void>> => {
    const response = await http.patch<ApiResponse<void>>(`/users/${username}/active`, null, {
      params: { active }
    })
    return response.data
  }
}
