import { useQueryClient } from '@tanstack/react-query'
import type { UserResponse } from '@/schemas/user.schema'
import { researchGroupService } from '@/services/research-group.service'
import type { CreateResearchGroupRequest, UpdateResearchGroupRequest } from '@/schemas/research-group.schema'
import { createQuery, createInfiniteQuery, createMutation, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'

export const useResearchGroupsQuery = (
  params: {
    page: number
    limit: number
    keyword?: string
    type?: string
    leaderId?: number
  },
  enabled = true
) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.LIST(params),
    queryFn: async () => {
      const response = await researchGroupService.filterGroups(params)
      return response.data
    },
    enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useResearchGroupsInfiniteQuery = (params: {
  limit: number
  keyword?: string
  type?: string
  leaderId?: number
}) => {
  return createInfiniteQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.INFINITE(params),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await researchGroupService.filterGroups({
        ...params,
        page: pageParam as number
      })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.data || lastPage.data.page >= lastPage.data.totalPages) return undefined
      return lastPage.data.page + 1
    },
    initialPageParam: 1,
    ...QUERY_POLICIES.INFINITE
  })()
}

export const useLeadersQuery = (params: { keyword?: string }, enabled = true) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.LEADERS(params),
    queryFn: async () => {
      const response = await researchGroupService.filterLeaders(params)
      return response.data
    },
    enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useOtherResearchGroupsQuery = (
  params: {
    page: number
    limit: number
    keyword?: string
    type?: string
    leaderId?: number
  },
  enabled = true
) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.OTHER(params),
    queryFn: async () => {
      const response = await researchGroupService.filterOtherGroups(params)
      return response.data
    },
    enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useOtherLeadersQuery = (params: { keyword?: string }, enabled = true) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.OTHER_LEADERS(params),
    queryFn: async () => {
      const response = await researchGroupService.filterOtherLeaders(params)
      return response.data
    },
    enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useMyResearchGroupsQuery = (
  params: {
    page: number
    limit: number
    keyword?: string
    type?: string
    leaderId?: number
    isPrivate?: boolean
  },
  enabled = true
) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.MINE(params),
    queryFn: async () => {
      const response = await researchGroupService.filterMyGroups(params)
      return response.data
    },
    enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useMyLeadersQuery = (params: { keyword?: string }, enabled = true) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.MY_LEADERS(params),
    queryFn: async () => {
      const response = await researchGroupService.filterMyLeaders(params)
      return response.data
    },
    enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useResearchGroupDetailQuery = (id: number, isAuthenticated = false) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.DETAIL(id),
    queryFn: async () => {
      const response = isAuthenticated
        ? await researchGroupService.findMyGroupDetail(id)
        : await researchGroupService.findPublicGroupById(id)
      return response.data
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useLecturerResearchGroupDetailQuery = (id: number) => {
  return createQuery({
    queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.DETAIL(id),
    queryFn: async () => {
      const response = await researchGroupService.findMyGroupDetail(id)
      return response.data
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useGroupMembersQuery = (groupId: number, enabled = true, params?: { page?: number; limit?: number }) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.MEMBERS(groupId, params),
    queryFn: async () => {
      const response = await researchGroupService.findMembersByGroupId(groupId, params)
      return response.data.data?.data || []
    },
    enabled: enabled && !!groupId,
    ...QUERY_POLICIES.LIST
  })()
}

export const useManagedResearchGroupsQuery = (
  params: {
    page: number
    limit: number
    keyword?: string
    groupType?: string
    isPrivate?: boolean
    active?: boolean
  },
  enabled = true
) => {
  return createQuery({
    queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.MANAGED(params),
    queryFn: async () => {
      const response = await researchGroupService.filterManagedResearchGroups(params)
      return response.data
    },
    enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useManagedResearchGroupsInfiniteQuery = (params: {
  limit: number
  keyword?: string
  groupType?: string
  isPrivate?: boolean
  active?: boolean
}) => {
  return createInfiniteQuery({
    queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.INFINITE_MANAGED(params),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await researchGroupService.filterManagedResearchGroups({
        ...params,
        page: pageParam as number
      })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.data || lastPage.data.page >= lastPage.data.totalPages) return undefined
      return lastPage.data.page + 1
    },
    initialPageParam: 1,
    ...QUERY_POLICIES.INFINITE
  })()
}

export const useSearchUsersToInviteQuery = (params: {
  groupId: number
  keyword?: string
  page?: number
  size?: number
  enabled?: boolean
}) => {
  const { enabled, ...searchParams } = params
  return createQuery<UserResponse[]>({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.SEARCH_TO_INVITE(params.groupId, searchParams),
    queryFn: async () => {
      const response = await researchGroupService.filterUsersToInvite(params.groupId, searchParams)
      return response.data.data?.data || []
    },
    enabled: enabled !== false && !!params.groupId,
    ...QUERY_POLICIES.LIST
  })()
}

export const useAddMembersMutation = (groupId: number) => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (members: { username: string; role: string }[]) => researchGroupService.addMembers(groupId, members),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT })
    }
  })()
}

export const useToggleResearchGroupStatus = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: (id: number) => researchGroupService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT })
    }
  })()
}

export const useCreateResearchGroupMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: (data: CreateResearchGroupRequest) => researchGroupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT })
    }
  })()
}

export const useUpdateResearchGroupMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateResearchGroupRequest }) =>
      researchGroupService.updateGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT })
    }
  })()
}

export const useUpdateMemberRoleMutation = (groupId: number) => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: (data: { username: string; role: string }) => researchGroupService.updateMemberRole(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT })
    }
  })()
}

export const useJoinedGroupsQuery = (enabled = true, params?: { page?: number; limit?: number }) => {
  return createQuery({
    queryKey: QUERY_KEYS.RESEARCH_GROUP.MINE(params || {}),
    queryFn: async () => {
      const response = await researchGroupService.findMyJoinedGroups(params)
      return response.data.data?.data || []
    },
    enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useAdminResearchGroupsQuery = (
  params: {
    page: number
    limit: number
    keyword?: string
    type?: string
    active?: boolean
    isPrivate?: boolean
  },
  enabled = true
) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_RESEARCH_GROUP.LIST(params),
    queryFn: async () => {
      const response = await researchGroupService.filterResearchGroupsAdmin(params)
      return response.data
    },
    enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useAdminResearchGroupsInfiniteQuery = (params: {
  limit: number
  keyword?: string
  type?: string
  active?: boolean
  isPrivate?: boolean
}) => {
  return createInfiniteQuery({
    queryKey: QUERY_KEYS.ADMIN_RESEARCH_GROUP.INFINITE(params),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await researchGroupService.filterResearchGroupsAdmin({
        ...params,
        page: pageParam as number
      })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.data || lastPage.data.page >= lastPage.data.totalPages) return undefined
      return lastPage.data.page + 1
    },
    initialPageParam: 1,
    ...QUERY_POLICIES.INFINITE
  })()
}

export const useGroupDetailAdminQuery = (id: number) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_RESEARCH_GROUP.DETAIL(id),
    queryFn: async () => {
      const response = await researchGroupService.findGroupByIdAdmin(id)
      return response.data
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })()
}
