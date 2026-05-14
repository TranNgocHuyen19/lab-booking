import { useQueryClient } from '@tanstack/react-query'
import systemConfigService from '@/services/system-config.service'
import { createQuery, createMutation, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'
import type {
  UpdateAttendanceSystemConfigRequest,
  UpdateBookingSystemConfigRequest
} from '@/schemas/system-config.schema'

export const useAttendanceConfigQuery = (options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.SYSTEM_CONFIG.ATTENDANCE,
    queryFn: () => systemConfigService.getAttendanceConfig().then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useBookingConfigQuery = (options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.SYSTEM_CONFIG.BOOKING,
    queryFn: () => systemConfigService.getBookingConfig().then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.DETAIL
  })()
}

export const useAttendanceHistoryQuery = (options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.SYSTEM_CONFIG.ATTENDANCE_HISTORY,
    queryFn: () => systemConfigService.getAttendanceHistory().then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useBookingHistoryQuery = (options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.SYSTEM_CONFIG.BOOKING_HISTORY,
    queryFn: () => systemConfigService.getBookingHistory().then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useAllConfigHistoryQuery = (options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.SYSTEM_CONFIG.ALL_HISTORY,
    queryFn: () => systemConfigService.getAllHistory().then((res) => res.data.data),
    enabled: options?.enabled,
    ...QUERY_POLICIES.LIST
  })()
}

export const useUpdateAttendanceConfigMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (data: UpdateAttendanceSystemConfigRequest) =>
      systemConfigService.updateAttendanceConfig(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.ATTENDANCE })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.ATTENDANCE_HISTORY })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.ALL_HISTORY })
    }
  })()
}

export const useUpdateBookingConfigMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (data: UpdateBookingSystemConfigRequest) =>
      systemConfigService.updateBookingConfig(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.BOOKING })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.BOOKING_HISTORY })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.ALL_HISTORY })
    }
  })()
}

export const useUpdateAttendanceFieldMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ key, value, reason }: { key: string; value: number; reason?: string }) =>
      systemConfigService.updateAttendanceField(key, { value, reason }).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.ATTENDANCE })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.ATTENDANCE_HISTORY })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.ALL_HISTORY })
    }
  })()
}

export const useUpdateBookingFieldMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: ({ key, value, reason }: { key: string; value: number; reason?: string }) =>
      systemConfigService.updateBookingField(key, { value, reason }).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.BOOKING })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.BOOKING_HISTORY })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_CONFIG.ALL_HISTORY })
    }
  })()
}
