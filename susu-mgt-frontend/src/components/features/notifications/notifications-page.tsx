import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/use-notifications'
import { format } from 'date-fns'

export function NotificationsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const { data, isLoading: isLoadingList } = useNotifications({ page, limit })
  const { data: unreadData } = useUnreadCount()
  const markReadMutation = useMarkNotificationRead()
  const markAllMutation = useMarkAllNotificationsRead()

  const items = data?.data || []
  const totalPages = data?.meta?.totalPages ?? 1
  const unreadCount = unreadData?.unreadCount ?? 0
  const unreadLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Notifications</h1>
              <div className="relative">
                <Bell className="h-5 w-5 text-zinc-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                    {unreadLabel}
                  </span>
                )}
              </div>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Stay up to date with system updates and account activity.</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending}
          className="rounded-full"
        >
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6 border-b dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Recent notifications</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Page {page} of {totalPages}</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingList ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 dark:text-zinc-400">No notifications found.</div>
          ) : (
            <div className="divide-y dark:divide-zinc-800">
              {items.map((n) => {
                const isUnread = !n.readAt
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (isUnread) markReadMutation.mutate(n.id)
                    }}
                    className={cn(
                      'w-full text-left px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors',
                      isUnread && 'bg-blue-50/50 dark:bg-blue-900/10'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {n.subject ?? n.type}
                          </div>
                          <Badge variant={isUnread ? 'info' : 'secondary'} className="rounded-full">
                            {isUnread ? 'Unread' : 'Read'}
                          </Badge>
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                          {n.message}
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {format(new Date(n.createdAt), 'MMM dd, yyyy - HH:mm')}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between p-4 md:p-6 border-t dark:border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
