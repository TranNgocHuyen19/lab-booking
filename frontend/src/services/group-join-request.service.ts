import http from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import type {
  CreateJoinRequestRequest,
  GroupJoinRequestResponse,
  SecureGroupJoinRequestResponse,
  UpdateJoinRequestStatusRequest,
  GroupJoinRequestDetailResponse
} from '@/schemas/group-join-request.schema'

export const groupJoinRequestService = {
  createJoinRequest: (data: CreateJoinRequestRequest) => http.post<ApiResponse<string>>('/group-join-requests', data),

  findMyJoinRequests: (params: { page: number; size: number; status?: string }) =>
    http.get<ApiResponse<PageResponse<GroupJoinRequestResponse[]>>>('/group-join-requests/my-requests', {
      params
    }),

  filterJoinRequestsForMyGroups: (params: {
    page: number
    size: number
    status?: string
    keyword?: string
    researchGroupId?: number
    fromDate?: string
    toDate?: string
  }) =>
    http.get<ApiResponse<PageResponse<SecureGroupJoinRequestResponse[]>>>('/group-join-requests/my-groups', {
      params
    }),

  filterAllJoinRequestsAdmin: (params: {
    page: number
    size: number
    status?: string
    keyword?: string
    researchGroupId?: number
    fromDate?: string
    toDate?: string
  }) =>
    http.get<ApiResponse<PageResponse<SecureGroupJoinRequestResponse[]>>>('/group-join-requests/admin', {
      params
    }),

  findJoinRequestsForGroup: (
    groupId: number,
    params: { page: number; size: number; status?: string; keyword?: string }
  ) =>
    http.get<ApiResponse<PageResponse<SecureGroupJoinRequestResponse[]>>>(`/group-join-requests/group/${groupId}`, {
      params
    }),

  findRequestById: (requestId: number) =>
    http.get<ApiResponse<GroupJoinRequestDetailResponse>>(`/group-join-requests/${requestId}`),

  approveJoinRequest: (requestId: number, data?: UpdateJoinRequestStatusRequest) =>
    http.patch<ApiResponse<SecureGroupJoinRequestResponse>>(`/group-join-requests/${requestId}/approve`, data),

  rejectJoinRequest: (requestId: number, data: UpdateJoinRequestStatusRequest) =>
    http.patch<ApiResponse<SecureGroupJoinRequestResponse>>(`/group-join-requests/${requestId}/reject`, data),

  cancelJoinRequest: (requestId: number) =>
    http.patch<ApiResponse<GroupJoinRequestResponse>>(`/group-join-requests/${requestId}/cancel`),

  bulkApproveJoinRequests: (requestIds: number[], responseNote?: string) =>
    http.patch<ApiResponse<void>>('/group-join-requests/actions/bulk-approve', {
      requestIds,
      responseNote
    }),

  bulkRejectJoinRequests: (requestIds: number[], responseNote?: string) =>
    http.patch<ApiResponse<void>>('/group-join-requests/actions/bulk-reject', {
      requestIds,
      responseNote
    })
}
