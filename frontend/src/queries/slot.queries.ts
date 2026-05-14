import { useQueryClient } from '@tanstack/react-query'
import { slotService } from '@/services/slot.service'
import type { SlotRequest } from '@/schemas/slot.schema'
import { createQuery, createMutation, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'

// Public query - SlotResponse
export const useSlotsQuery = (params: { page?: number; limit?: number; keyword?: string } = {}) => {
  const queryParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
    keyword: params.keyword
  }
  return createQuery({
    queryKey: QUERY_KEYS.SLOT.LIST(queryParams),
    queryFn: () => slotService.getSlots(queryParams).then((res) => res.data),
    ...QUERY_POLICIES.LIST
  })()
}

// Admin query - SecureSlotResponse (getById returns secure data)
export const useSlotQuery = (id: number) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_SLOT.DETAIL(id),
    queryFn: () => slotService.getSlotById(id).then((res) => res.data),
    enabled: !!id,
    ...QUERY_POLICIES.DETAIL
  })()
}

// Admin query - SecureSlotResponse[] (from /slots/admin)
export const useFilterSlotsQuery = (params: { page: number; limit: number; keyword?: string; active?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.ADMIN_SLOT.FILTER(params),
    queryFn: () => slotService.filterSlots(params),
    ...QUERY_POLICIES.LIST
  })()
}

export const useCreateSlotMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: (data: SlotRequest) => slotService.createSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SLOT.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_SLOT.ROOT })
    }
  })()
}

export const useUpdateSlotMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ id, data }: { id: number; data: SlotRequest }) => slotService.updateSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SLOT.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_SLOT.ROOT })
    }
  })()
}

export const useToggleSlotActiveMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: (id: number) => slotService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SLOT.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_SLOT.ROOT })
    }
  })()
}

export const useUpdateBulkSlotStatusMutation = () => {
  const queryClient = useQueryClient()
  return createMutation({
    mutationFn: ({ ids, active }: { ids: number[]; active: boolean }) => slotService.updateBulkStatus(ids, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SLOT.ROOT })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_SLOT.ROOT })
    }
  })()
}
