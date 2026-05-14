import http from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import type {
  DeviceRequest,
  DeviceResponse,
  DeviceAvailabilityParams,
  DeviceAvailabilityResponse,
  SecuredDeviceResponse,
  FindDevicesParams
} from '@/schemas/device.schema'

const deviceService = {
  create: (body: DeviceRequest) => http.post<ApiResponse<DeviceResponse>>('/devices', body),

  update: (id: number, body: DeviceRequest) => http.put<ApiResponse<DeviceResponse>>(`/devices/${id}`, body),

  getById: (id: number) => http.get<ApiResponse<DeviceResponse>>(`/devices/${id}`),

  filterDevices: (params: FindDevicesParams) =>
    http.get<ApiResponse<PageResponse<SecuredDeviceResponse[]>>>('/devices/admin', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        keyword: params.keyword,
        active: params.active
      }
    }),

  toggleActive: (id: number) => http.patch<ApiResponse<void>>(`/devices/${id}/status`),

  updateBulkStatus: (ids: number[], active: boolean) =>
    http.patch<ApiResponse<void>>('/devices/actions/bulk-active', { ids, active }),

  getAvailability: (params: DeviceAvailabilityParams) =>
    http.get<ApiResponse<DeviceAvailabilityResponse[]>>('/devices/availability', {
      params: {
        labRoomId: params.labRoomId,
        date: params.date,
        slotIds: params.slotIds.join(','),
        excludeBookingId: params.excludeBookingId
      }
    })
}

export default deviceService
