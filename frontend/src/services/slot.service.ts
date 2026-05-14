import http from '@/lib/http'
import { type ApiResponse, type PageResponse } from '@/schemas/base.schema'
import { type SecureSlotResponse, type SlotRequest, type SlotResponse } from '@/schemas/slot.schema'

export const slotService = {
  getSlots: (params: { page: number; limit: number; keyword?: string }) =>
    http.get<ApiResponse<PageResponse<SlotResponse[]>>>('/slots', { params }),

  getSlotById: (id: number) => http.get<ApiResponse<SecureSlotResponse>>(`/slots/${id}`),

  createSlot: (data: SlotRequest) => http.post<ApiResponse<SecureSlotResponse>>('/slots', data),

  updateSlot: (id: number, data: SlotRequest) => http.put<ApiResponse<SecureSlotResponse>>(`/slots/${id}`, data),

  filterSlots: (params: { page: number; limit: number; keyword?: string; active?: boolean }) =>
    http.get<ApiResponse<PageResponse<SecureSlotResponse[]>>>('/slots/admin', { params }),

  toggleActive: (id: number) => http.patch<ApiResponse<void>>(`/slots/${id}/status`),

  updateBulkStatus: (ids: number[], active: boolean) =>
    http.patch<ApiResponse<void>>('/slots/actions/bulk-active', { ids, active })
}
