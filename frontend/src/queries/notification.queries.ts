import { useQueryClient } from '@tanstack/react-query'
import notificationService from '@/services/notification.service'
import { createMutation, createQuery, QUERY_KEYS, QUERY_POLICIES } from '@/query-core'

export const useNotificationsQuery = (params: { page?: number; limit?: number } = {}, options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.NOTIFICATION.LIST(params),
    queryFn: () => notificationService.getMyNotifications(params).then((res) => res.data.data),
    enabled: options?.enabled,
    refetchInterval: 30_000,
    ...QUERY_POLICIES.REALTIME
  })()
}

export const useUnreadNotificationCountQuery = (options?: { enabled?: boolean }) => {
  return createQuery({
    queryKey: QUERY_KEYS.NOTIFICATION.UNREAD_COUNT,
    queryFn: () => notificationService.getUnreadCount().then((res) => res.data.data),
    enabled: options?.enabled,
    refetchInterval: 30_000,
    ...QUERY_POLICIES.REALTIME
  })()
}

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: (notificationId: number) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATION.ROOT })
    }
  })()
}

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient()

  return createMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATION.ROOT })
    }
  })()
}
