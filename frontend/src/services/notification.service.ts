import http from '@/lib/http'
import type { ApiResponse, PageResponse } from '@/schemas/base.schema'
import type { NotificationResponse, UnreadNotificationCountResponse } from '@/schemas/notification.schema'

const notificationService = {
  getMyNotifications: (params: { page?: number; limit?: number } = {}) =>
    http.get<ApiResponse<PageResponse<NotificationResponse[]>>>('/notifications', { params }),

  getUnreadCount: () => http.get<ApiResponse<UnreadNotificationCountResponse>>('/notifications/unread-count'),

  markAsRead: (notificationId: number) => http.patch<ApiResponse<void>>(`/notifications/${notificationId}/read`),

  markAllAsRead: () => http.patch<ApiResponse<void>>('/notifications/read-all')
}

export default notificationService
