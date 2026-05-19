import { useQueryClient } from '@tanstack/react-query'
import { groupJoinRequestService } from '@/services/group-join-request.service'
import type {
  CreateJoinRequestRequest,
  UpdateJoinRequestStatusRequest,
  GroupJoinRequestResponse,
  SecureGroupJoinRequestResponse
} from '@/schemas/group-join-request.schema'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import type { MyResearchGroupResponse, ResearchGroupResponse } from '@/schemas/research-group.schema'
import { RequestStatus } from '@/constants/types'
import { createQuery, createMutation, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'

export const useMyJoinRequestsQuery = (params: { page: number; size: number; status?: string }) => {
  return createQuery({
    queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.MY_REQUESTS(params),
    queryFn: async () => {
      const response = await groupJoinRequestService.findMyJoinRequests(params)
      return response.data
    },
    ...QUERY_POLICIES.LIST
  })()
}

export const useMyGroupsJoinRequestsQuery = (params: {
  page: number
  size: number
  status?: string
  keyword?: string
  researchGroupId?: number
  fromDate?: string
  toDate?: string
}) => {
  return createQuery({
    queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.MY_GROUPS(params),
    queryFn: async () => {
      const response = await groupJoinRequestService.filterJoinRequestsForMyGroups(params)
      return response.data
    },
    ...QUERY_POLICIES.LIST
  })()
}

export const useAllGroupsJoinRequestsQuery = (params: {
  page: number
  size: number
  status?: string
  keyword?: string
  researchGroupId?: number
  fromDate?: string
  toDate?: string
}) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_GROUP_JOIN_REQUEST.ALL_GROUPS(params),
    queryFn: async () => {
      const response = await groupJoinRequestService.filterAllJoinRequestsAdmin(params)
      return response.data
    },
    ...QUERY_POLICIES.LIST
  })()
}
//todo: sửa giúp b chổ này thành create que
export const useGroupJoinRequestsQuery = (
  groupId: number,
  params: { page: number; size: number; status?: string; keyword?: string }
) => {
  return createQuery({
    queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.BY_GROUP(groupId, params),
    queryFn: async () => {
      const response = await groupJoinRequestService.findJoinRequestsForGroup(groupId, params)
      return response.data
    },
    ...QUERY_POLICIES.LIST
  })()
}

export const useJoinRequestByIdQuery = (requestId: number) => {
  return createQuery({
    queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.DETAIL(requestId),
    queryFn: async () => {
      const response = await groupJoinRequestService.findRequestById(requestId)
      return response.data
    },
    enabled: !!requestId,
    ...QUERY_POLICIES.DETAIL
  })()
}

// Helper functions for cache updates
const updateRequestStatusInCache = <T extends { requestId: number; status: string }>(
  oldData: PageResponse<T[]> | undefined,
  requestId: number,
  newStatus: string
): PageResponse<T[]> | undefined => {
  if (!oldData) return oldData
  return {
    ...oldData,
    data: oldData.data.map((req) => (req.requestId === requestId ? { ...req, status: newStatus } : req))
  }
}

const updateGroupRequestStatusInCache = (
  oldData: ApiResponse<PageResponse<ResearchGroupResponse[]>> | undefined,
  groupId: number,
  requestStatus: string | null,
  requestId: number | null
): ApiResponse<PageResponse<ResearchGroupResponse[]>> | undefined => {
  if (!oldData?.data) return oldData
  if (!Array.isArray(oldData.data.data)) return oldData

  return {
    ...oldData,
    data: {
      ...oldData.data,
      data: oldData.data.data.map((group) =>
        group.researchGroupId === groupId ? { ...group, requestStatus, requestId } : group
      )
    }
  }
}

const updateGroupDetailRequestStatusInCache = <T extends ResearchGroupResponse | MyResearchGroupResponse>(
  oldData: ApiResponse<T> | undefined,
  groupId: number,
  requestStatus: string | null,
  requestId: number | null
): ApiResponse<T> | undefined => {
  if (!oldData?.data || oldData.data.researchGroupId !== groupId) return oldData

  return {
    ...oldData,
    data: {
      ...oldData.data,
      requestStatus,
      requestId
    }
  }
}

export const useCreateJoinRequestMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (data: CreateJoinRequestRequest) => groupJoinRequestService.createJoinRequest(data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_GROUP_JOIN_REQUEST.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT })

      queryClient.setQueriesData<ApiResponse<PageResponse<ResearchGroupResponse[]>>>(
        { queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT },
        (old) => updateGroupRequestStatusInCache(old, variables.researchGroupId, 'PENDING', null)
      )
      queryClient.setQueryData<ApiResponse<ResearchGroupResponse | MyResearchGroupResponse>>(
        QUERY_KEYS.RESEARCH_GROUP.DETAIL(variables.researchGroupId),
        (old) => updateGroupDetailRequestStatusInCache(old, variables.researchGroupId, 'PENDING', null)
      )
    }
  })()
}

export const useApproveJoinRequestMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ requestId, data }: { requestId: number; data?: UpdateJoinRequestStatusRequest }) =>
      groupJoinRequestService.approveJoinRequest(requestId, data),

    onMutate: async ({ requestId }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT })

      const previousData = queryClient.getQueriesData<ApiResponse<PageResponse<SecureGroupJoinRequestResponse[]>>>({
        queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT
      })

      queryClient.setQueriesData<ApiResponse<PageResponse<SecureGroupJoinRequestResponse[]>>>(
        { queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT },
        (old) => {
          if (!old?.data) return old
          const newData = updateRequestStatusInCache(old.data, requestId, RequestStatus.APPROVED)
          return newData ? { ...old, data: newData } : old
        }
      )

      return { previousData }
    },

    onError: (_err, _variables, context) => {
      context?.previousData.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },

    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.DETAIL(variables.requestId) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_GROUP_JOIN_REQUEST.DETAIL(variables.requestId) })
      ])
    }
  })()
}

export const useRejectJoinRequestMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ requestId, data }: { requestId: number; data: UpdateJoinRequestStatusRequest }) =>
      groupJoinRequestService.rejectJoinRequest(requestId, data),

    onMutate: async ({ requestId }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT })

      const previousData = queryClient.getQueriesData<ApiResponse<PageResponse<SecureGroupJoinRequestResponse[]>>>({
        queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT
      })

      queryClient.setQueriesData<ApiResponse<PageResponse<SecureGroupJoinRequestResponse[]>>>(
        { queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT },
        (old) => {
          if (!old?.data) return old
          const newData = updateRequestStatusInCache(old.data, requestId, RequestStatus.REJECTED)
          return newData ? { ...old, data: newData } : old
        }
      )

      return { previousData }
    },

    onError: (_err, _variables, context) => {
      context?.previousData.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },

    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.DETAIL(variables.requestId) }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_GROUP_JOIN_REQUEST.DETAIL(variables.requestId) })
      ])
    }
  })()
}

export const useCancelJoinRequestMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (requestId: number) => groupJoinRequestService.cancelJoinRequest(requestId),

    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.ROOT })

      const previousData = queryClient.getQueriesData<ApiResponse<PageResponse<GroupJoinRequestResponse[]>>>({
        queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.ROOT
      })

      queryClient.setQueriesData<ApiResponse<PageResponse<GroupJoinRequestResponse[]>>>(
        { queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.ROOT },
        (old) => {
          if (!old?.data) return old
          const newData = updateRequestStatusInCache(old.data, requestId, RequestStatus.CANCELED)
          return newData ? { ...old, data: newData } : old
        }
      )

      return { previousData }
    },

    onError: (_err, _requestId, context) => {
      context?.previousData.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },

    onSuccess: async (response) => {
      const updatedRequest = response.data.data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT })
      ])

      if (updatedRequest) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.DETAIL(updatedRequest.requestId) }),
          queryClient.setQueriesData<ApiResponse<PageResponse<ResearchGroupResponse[]>>>(
            { queryKey: QUERY_KEYS.RESEARCH_GROUP.ROOT },
            (old) => updateGroupRequestStatusInCache(old, updatedRequest.researchGroupId, null, null)
          ),
          queryClient.setQueryData<ApiResponse<ResearchGroupResponse | MyResearchGroupResponse>>(
            QUERY_KEYS.RESEARCH_GROUP.DETAIL(updatedRequest.researchGroupId),
            (old) => updateGroupDetailRequestStatusInCache(old, updatedRequest.researchGroupId, null, null)
          )
        ])
      }
    }
  })()
}

export const useBulkApproveJoinRequestsMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ requestIds, responseNote }: { requestIds: number[]; responseNote?: string }) =>
      groupJoinRequestService.bulkApproveJoinRequests(requestIds, responseNote),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT })
      ])
    }
  })()
}

export const useBulkRejectJoinRequestsMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ requestIds, responseNote }: { requestIds: number[]; responseNote?: string }) =>
      groupJoinRequestService.bulkRejectJoinRequests(requestIds, responseNote),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_GROUP_JOIN_REQUEST.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_RESEARCH_GROUP.ROOT }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LECTURER_DASHBOARD.ROOT })
      ])
    }
  })()
}
