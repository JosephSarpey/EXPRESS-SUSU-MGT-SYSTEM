import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService, PaginationParams } from '@/services/api/notifications.service'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: PaginationParams) => [...notificationKeys.lists(), { filters }] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

export function useNotifications(params: PaginationParams = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsService.getMyNotifications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // Poll every minute
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Poll every 30 seconds
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onMutate: async () => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      // Snapshot previous unread count
      const previousUnreadCount = queryClient.getQueryData<{ unreadCount: number }>(notificationKeys.unreadCount())

      // Optimistically decrement unread count
      if (previousUnreadCount && previousUnreadCount.unreadCount > 0) {
        queryClient.setQueryData(notificationKeys.unreadCount(), {
          unreadCount: previousUnreadCount.unreadCount - 1,
        })
      }

      return { previousUnreadCount }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(notificationKeys.unreadCount(), context.previousUnreadCount)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousUnreadCount = queryClient.getQueryData<{ unreadCount: number }>(notificationKeys.unreadCount())

      // Optimistically set unread count to 0
      queryClient.setQueryData(notificationKeys.unreadCount(), { unreadCount: 0 })

      return { previousUnreadCount }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousUnreadCount) {
        queryClient.setQueryData(notificationKeys.unreadCount(), context.previousUnreadCount)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
