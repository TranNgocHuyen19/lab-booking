import { useQueryClient } from '@tanstack/react-query'
import labRoomService from '@/services/lab-room.service'
import type { LabRoomRequest, FindLabRoomsParams } from '@/schemas/lab-room.schema'
import { createQuery, createMutation, createInfiniteQuery, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'

export const useLabRoomsQuery = (params: FindLabRoomsParams = {}) => {
  return createQuery({
    queryKey: QUERY_KEYS.LAB_ROOM.LIST(params),
    queryFn: async () => {
      const response = await labRoomService.find(params)
      return response.data
    },
    ...QUERY_POLICIES.LIST
  })()
}

export const useLabRoomByIdQuery = (id: number) => {
  return createQuery({
    queryKey: QUERY_KEYS.LAB_ROOM.LIST({ id }),
    queryFn: async () => {
      const response = await labRoomService.getById(id)
      return response.data.data
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useLabRoomByIdAdminQuery = (id: number) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_LAB_ROOM.DETAIL(id),
    queryFn: async () => {
      const response = await labRoomService.getByIdAdmin(id)
      return response.data.data
    },
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useFilterLabRoomsQuery = (params: FindLabRoomsParams = {}) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_LAB_ROOM.FILTER(params),
    queryFn: async () => {
      const response = await labRoomService.filter(params)
      return response.data
    },
    ...QUERY_POLICIES.LIST
  })()
}

export const useInfiniteFilterLabRoomsQuery = (params: FindLabRoomsParams = {}) => {
  return createInfiniteQuery({
    queryKey: QUERY_KEYS.ADMIN_LAB_ROOM.INFINITE_FILTER(params),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await labRoomService.filter({ ...params, page: pageParam as number })
      return response.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.data) return undefined
      if (lastPage.data.page >= lastPage.data.totalPages) return undefined
      return lastPage.data.page + 1
    },
    initialPageParam: 1,
    ...QUERY_POLICIES.INFINITE
  })()
}

export const useCreateLabRoomMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (data: LabRoomRequest) => labRoomService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_LAB_ROOM.ROOT })
    }
  })()
}

export const useUpdateLabRoomMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ id, data }: { id: number; data: LabRoomRequest }) => labRoomService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_LAB_ROOM.ROOT })
    }
  })()
}

export const useToggleLabRoomActiveMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: (id: number) => labRoomService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_LAB_ROOM.ROOT })
    }
  })()
}

export const useUpdateBulkLabRoomStatusMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ ids, active }: { ids: number[]; active: boolean }) => labRoomService.updateBulkStatus(ids, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_LAB_ROOM.ROOT })
    }
  })()
}
