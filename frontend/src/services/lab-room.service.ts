import http from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import type {
  LabRoomRequest,
  LabRoomResponse,
  SecureLabRoomResponse,
  FindLabRoomsParams
} from '@/schemas/lab-room.schema'

const labRoomService = {
  create: (body: LabRoomRequest) => http.post<ApiResponse<SecureLabRoomResponse>>('/lab-rooms', body),

  update: (id: number, body: LabRoomRequest) => http.put<ApiResponse<SecureLabRoomResponse>>(`/lab-rooms/${id}`, body),

  // Public endpoint - returns LabRoomResponse
  getById: (id: number) => http.get<ApiResponse<LabRoomResponse>>(`/lab-rooms/${id}`),

  // Admin endpoint - returns SecureLabRoomResponse
  getByIdAdmin: (id: number) => http.get<ApiResponse<SecureLabRoomResponse>>(`/lab-rooms/${id}/admin`),

  find: (params: FindLabRoomsParams) =>
    http.get<ApiResponse<PageResponse<LabRoomResponse[]>>>('/lab-rooms', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        keyword: params.keyword
      }
    }),

  filter: (params: FindLabRoomsParams) =>
    http.get<ApiResponse<PageResponse<SecureLabRoomResponse[]>>>('/lab-rooms/admin', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        keyword: params.keyword,
        active: params.active
      }
    }),

  toggleActive: (id: number) => http.patch<ApiResponse<void>>(`/lab-rooms/${id}/status`),

  updateBulkStatus: (ids: number[], active: boolean) =>
    http.patch<ApiResponse<void>>('/lab-rooms/actions/bulk-active', { ids, active })
}

export default labRoomService
