import { create } from 'zustand'
import {
  notificationsService,
  type Notification,
  type PaginationMeta,
  type PaginationParams,
} from '@/services/api/notifications.service'

interface NotificationsState {
  items: Notification[]
  meta: PaginationMeta | null
  unreadCount: number
  isLoadingList: boolean
  isLoadingUnread: boolean
  isMarkingAll: boolean
  error: string | null
  fetchList: (params?: PaginationParams) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: (params?: PaginationParams) => Promise<void>
  reset: () => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  meta: null,
  unreadCount: 0,
  isLoadingList: false,
  isLoadingUnread: false,
  isMarkingAll: false,
  error: null,

  fetchList: async (params = {}) => {
    set({ isLoadingList: true, error: null })
    try {
      const response = await notificationsService.getMyNotifications(params)
      set({ items: response.data, meta: response.meta })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load notifications' })
    } finally {
      set({ isLoadingList: false })
    }
  },

  fetchUnreadCount: async () => {
    if (get().isLoadingUnread) return

    set({ isLoadingUnread: true, error: null })
    try {
      const response = await notificationsService.getUnreadCount()
      set({ unreadCount: response.unreadCount })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load unread count' })
    } finally {
      set({ isLoadingUnread: false })
    }
  },

  markRead: async (id: string) => {
    set({ error: null })
    try {
      const updated = await notificationsService.markAsRead(id)

      set((state) => ({
        items: state.items.map((n) => (n.id === id ? updated : n)),
      }))

      await get().fetchUnreadCount()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to mark as read' })
    }
  },

  markAllRead: async (params) => {
    if (get().isMarkingAll) return

    set({ isMarkingAll: true, error: null })
    try {
      await notificationsService.markAllAsRead()
      const refreshParams = params ?? { page: 1, limit: 10 }
      await Promise.all([get().fetchUnreadCount(), get().fetchList(refreshParams)])
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to mark all as read' })
    } finally {
      set({ isMarkingAll: false })
    }
  },

  reset: () => {
    set({
      items: [],
      meta: null,
      unreadCount: 0,
      isLoadingList: false,
      isLoadingUnread: false,
      isMarkingAll: false,
      error: null,
    })
  },
}))
