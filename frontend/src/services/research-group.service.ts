import http from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import type {
  CreateResearchGroupRequest,
  MemberInfoResponse,
  MyResearchGroupResponse,
  ResearchGroupResponse,
  SecureResearchGroupResponse,
  UpdateResearchGroupRequest
} from '@/schemas/research-group.schema'
import type { UserResponse } from '@/schemas/user.schema'

export const researchGroupService = {
  filterGroups: (params: { page: number; limit: number; keyword?: string; type?: string; leaderId?: number }) =>
    http.get<ApiResponse<PageResponse<ResearchGroupResponse[]>>>('/research-groups', {
      params
    }),

  filterLeaders: (params: { keyword?: string }) =>
    http.get<ApiResponse<PageResponse<UserResponse[]>>>('/research-groups/leaders', {
      params
    }),

  filterMyGroups: (params: {
    page: number
    limit: number
    keyword?: string
    type?: string
    leaderId?: number
    isPrivate?: boolean
  }) =>
    http.get<ApiResponse<PageResponse<ResearchGroupResponse[]>>>('/research-groups/my', {
      params
    }),

  filterMyLeaders: (params: { keyword?: string }) =>
    http.get<ApiResponse<PageResponse<UserResponse[]>>>('/research-groups/my/leaders', {
      params
    }),

  filterOtherGroups: (params: { page: number; limit: number; keyword?: string; type?: string; leaderId?: number }) =>
    http.get<ApiResponse<PageResponse<ResearchGroupResponse[]>>>('/research-groups/other', {
      params
    }),

  filterOtherLeaders: (params: { keyword?: string }) =>
    http.get<ApiResponse<PageResponse<UserResponse[]>>>('/research-groups/other/leaders', {
      params
    }),

  findPublicGroupById: (id: number) => http.get<ApiResponse<ResearchGroupResponse>>(`/research-groups/${id}`),

  findGroupById: (id: number) => http.get<ApiResponse<ResearchGroupResponse>>(`/research-groups/${id}/find`),

  findMyGroupDetail: (id: number) => http.get<ApiResponse<MyResearchGroupResponse>>(`/research-groups/${id}/my-detail`),

  addMembers: (groupId: number, members: { username: string; role: string }[]) =>
    http.post<ApiResponse<ResearchGroupResponse>>(`/research-groups/${groupId}/members`, { members }),

  findMembersByGroupId: (id: number, params?: { page?: number; limit?: number }) =>
    http.get<ApiResponse<PageResponse<MemberInfoResponse[]>>>(`/research-groups/${id}/members`, { params }),

  filterManagedResearchGroups: (params: {
    page: number
    limit: number
    keyword?: string
    groupType?: string
    isPrivate?: boolean
    active?: boolean
  }) =>
    http.get<ApiResponse<PageResponse<SecureResearchGroupResponse[]>>>('/research-groups/managed', {
      params
    }),

  toggleStatus: (id: number) => http.patch<ApiResponse<SecureResearchGroupResponse>>(`/research-groups/${id}/status`),
  createGroup: (data: CreateResearchGroupRequest) =>
    http.post<ApiResponse<SecureResearchGroupResponse>>('/research-groups', data),
  updateGroup: (id: number, data: UpdateResearchGroupRequest) =>
    http.patch<ApiResponse<SecureResearchGroupResponse>>(`/research-groups/${id}`, data),

  filterUsersToInvite: (id: number, params: { page?: number; size?: number; keyword?: string }) =>
    http.get<ApiResponse<PageResponse<UserResponse[]>>>(`/research-groups/${id}/search-to-invite`, {
      params
    }),

  updateMemberRole: (groupId: number, data: { username: string; role: string }) =>
    http.patch<ApiResponse<string>>(`/research-groups/${groupId}/members/role`, data),
  findMyJoinedGroups: (params?: { page?: number; limit?: number }) =>
    http.get<ApiResponse<PageResponse<ResearchGroupResponse[]>>>('/research-groups/joined', { params }),
  filterResearchGroupsAdmin: (params: {
    page: number
    limit: number
    keyword?: string
    type?: string
    active?: boolean
    isPrivate?: boolean
  }) =>
    http.get<ApiResponse<PageResponse<SecureResearchGroupResponse[]>>>('/research-groups/admin', {
      params
    }),
  findGroupByIdAdmin: (id: number) => http.get<ApiResponse<SecureResearchGroupResponse>>(`/research-groups/admin/${id}`)
}
