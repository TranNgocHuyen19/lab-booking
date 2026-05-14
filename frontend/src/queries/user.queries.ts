import { useQueryClient } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/http'
import { userService } from '@/services/user.service'
import type { UserResponse, UpdateUserRequest, CreateUserRequest, SecureUserResponse } from '@/schemas/user.schema'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import { createQuery, createMutation, QUERY_KEYS, QUERY_POLICIES, createInfiniteQuery } from '@/query-core'

export const useMeQuery = () => {
  const hasToken = !!getAccessToken()

  return createQuery({
    queryKey: QUERY_KEYS.USER.ME,
    queryFn: async () => {
      const response = await userService.me()
      return response.data
    },
    enabled: hasToken,
    retry: false,
    ...QUERY_POLICIES.LIST
  })()
}

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (body: UpdateUserRequest) => userService.updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.ROOT })
    }
  })()
}

export const useUpdateUserAdminMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ username, body }: { username: string; body: UpdateUserRequest }) =>
      userService.updateUserAdmin(username, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.DETAIL(variables.username) })
    }
  })()
}

export const useUserByIdQuery = (id: string) => {
  return createQuery({
    queryKey: QUERY_KEYS.USER.DETAIL(id),
    queryFn: async () => {
      const response = await userService.getById(id)
      return response.data
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useSearchUsersQuery = (params: { keyword?: string; page?: number; size?: number }) => {
  return createQuery<UserResponse[]>({
    queryKey: QUERY_KEYS.USER.SEARCH(params),
    queryFn: () => userService.searchUsers(params),
    ...QUERY_POLICIES.LIST
  })()
}

export const useAdminFilterUsersQuery = (params: {
  keyword?: string
  role?: string
  active?: boolean
  page?: number
  size?: number
}) => {
  return createQuery<ApiResponse<PageResponse<SecureUserResponse[]>>>({
    queryKey: ['users', 'admin', params],
    queryFn: () => userService.filterUsersAdmin(params),
    ...QUERY_POLICIES.LIST
  })()
}

export const useInfiniteAdminFilterUsersQuery = (params: { keyword?: string; role?: string; size?: number }) => {
  return createInfiniteQuery({
    queryKey: ['users', 'admin', 'infinite', params],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await userService.filterUsersAdmin({
        ...params,
        page: pageParam as number,
        size: params.size
      })
      return response.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined),
    ...QUERY_POLICIES.INFINITE
  })()
}

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (body: CreateUserRequest) => userService.createUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'admin'] })
    }
  })()
}

export const useUpdateUserActiveMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ username, active }: { username: string; active: boolean }) =>
      userService.updateActive(username, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'admin'] })
    }
  })()
}
