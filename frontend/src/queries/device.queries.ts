import { useQueryClient } from '@tanstack/react-query'
import deviceService from '@/services/device.service'
import type { DeviceRequest, FindDevicesParams, DeviceAvailabilityParams } from '@/schemas/device.schema'
import { createQuery, createInfiniteQuery, createMutation, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'

// Admin query - SecuredDeviceResponse[] with infinite scroll (from /devices/admin)
export const useInfiniteFilterDevicesQuery = (params: FindDevicesParams = {}, options?: { enabled?: boolean }) => {
  return createInfiniteQuery({
    queryKey: QUERY_KEYS.ADMIN_DEVICE.INFINITE_FILTER({ ...params, limit: 10 }),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await deviceService.filterDevices({ ...params, page: pageParam, limit: 10 })
      return response.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.page < lastPage.data.totalPages) {
        return lastPage.data.page + 1
      }
      return undefined
    },
    select: (data) => {
      return {
        pages: data.pages.flatMap((page) => page.data.data),
        pageParams: data.pageParams
      }
    },
    enabled: options?.enabled,
    ...QUERY_POLICIES.INFINITE
  })()
}

// Admin query - SecuredDeviceResponse[] (from /devices/admin)
export const useFilterDevicesQuery = (params: FindDevicesParams = {}, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_DEVICE.FILTER(params),
    queryFn: async () => {
      const response = await deviceService.filterDevices(params)
      return response.data
    },
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}

// Admin query - DeviceResponse
export const useDeviceByIdQuery = (id: number) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_DEVICE.DETAIL(id),
    queryFn: async () => {
      const response = await deviceService.getById(id)
      return response.data
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })()
}

// Public query - DeviceAvailabilityResponse
export const useDeviceAvailabilityQuery = (params: DeviceAvailabilityParams, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.DEVICE.AVAILABILITY(params),
    queryFn: async () => {
      const response = await deviceService.getAvailability(params)
      return response.data
    },
    enabled: !!params.labRoomId && !!params.date && params.slotIds.length > 0 && (options?.enabled ?? true),
    ...QUERY_POLICIES.REALTIME
  })()
}

export const useCreateDeviceMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (data: DeviceRequest) => deviceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEVICE.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DEVICE.ROOT })
    }
  })()
}

export const useUpdateDeviceMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ id, data }: { id: number; data: DeviceRequest }) => deviceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEVICE.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DEVICE.ROOT })
    }
  })()
}

export const useToggleDeviceActiveMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (id: number) => deviceService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEVICE.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DEVICE.ROOT })
    }
  })()
}

export const useUpdateBulkDeviceStatusMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ ids, active }: { ids: number[]; active: boolean }) => deviceService.updateBulkStatus(ids, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DEVICE.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_DEVICE.ROOT })
    }
  })()
}
