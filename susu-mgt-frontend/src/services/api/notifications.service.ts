import { apiClient } from './client'

export interface Notification {
  id: string
  userId: string
  subject?: string | null
  message: string
  type: 'EMAIL' | 'SMS' | 'SYSTEM'
  readAt?: string | null
  createdAt: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export const notificationsService = {
  getMyNotifications: async (
    params: PaginationParams = {}
  ): Promise<{ data: Notification[]; meta: PaginationMeta }> => {
    const response = await apiClient.get('/notifications', { params })
    return response.data
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await apiClient.get('/notifications/unread-count')
    return response.data
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`)
    return response.data
  },

  markAllAsRead: async (): Promise<{ updated: number }> => {
    const response = await apiClient.patch('/notifications/read-all')
    return response.data
  },
}
