
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Check, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
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
    <div className="min-h-screen bg-[#051330] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a2253] border border-[#13367c] p-4 md:p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="rounded-xl bg-[#051330] border border-[#13367c] text-white hover:bg-[#13367c] hover:text-white shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <Badge className="bg-[#00e5a3] hover:bg-[#00e5a3]/90 text-[#051330] font-bold px-2 py-0.5 rounded-lg text-xs">
                    {unreadLabel} New
                  </Badge>
                )}
              </div>
              <p className="text-blue-200/60 text-xs md:text-sm mt-0.5">
                Stay updated with your system updates and activity.
              </p>
            </div>
          </div>

          <Button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending || unreadCount === 0}
            className="w-full sm:w-auto rounded-xl font-semibold bg-[#13367c] text-white hover:bg-[#1a47a2] disabled:opacity-40 border border-[#1d4fbc] text-xs md:text-sm py-5 sm:py-2"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        {/* Main Notifications Box */}
        <Card className="bg-[#0a2253] border-[#13367c] shadow-2xl overflow-hidden rounded-2xl">
          <CardHeader className="px-5 py-4 border-b border-[#13367c] bg-[#051330]/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-100">
                <Bell className="h-4 w-4 text-[#00e5a3]" />
                Recent Alerts
              </div>
              <div className="text-[10px] md:text-xs font-bold text-blue-200/40 tracking-wider">
                PAGE {page} OF {totalPages}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoadingList ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-[#051330]/60 border border-[#13367c]/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-full bg-[#051330] flex items-center justify-center mb-4 border border-[#13367c]">
                  <Inbox className="h-6 w-6 text-blue-200/40" />
                </div>
                <h3 className="font-semibold text-white text-sm md:text-base">All clear!</h3>
                <p className="text-xs text-blue-200/60 max-w-[240px] mt-1">
                  You don't have any notifications right now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#13367c]">
                {items.map((n) => {
                  const isUnread = !n.readAt
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (isUnread) markReadMutation.mutate(n.id)
                      }}
                      className={cn(
                        'w-full text-left px-5 py-4 md:py-5 hover:bg-[#13367c]/30 transition-all relative group flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4',
                        isUnread ? 'bg-[#051330]/50' : 'bg-transparent'
                      )}
                    >
                      {/* Left Unread Bar Indicator */}
                      {isUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00e5a3]" />
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-sm md:text-base font-bold truncate block",
                            isUnread ? "text-white" : "text-blue-100/70 font-medium"
                          )}>
                            {n.subject ?? n.type}
                          </span>
                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-[#00e5a3] shrink-0" />
                          )}
                        </div>
                        <p className={cn(
                          "text-xs md:text-sm leading-relaxed break-words line-clamp-2 sm:line-clamp-none",
                          isUnread ? "text-blue-100" : "text-blue-200/50"
                        )}>
                          {n.message}
                        </p>
                      </div>
                      
                      {/* Timestamp & Meta Data */}
                      <div className="text-[10px] md:text-xs text-blue-200/40 font-medium whitespace-nowrap self-end sm:self-start shrink-0">
                        {format(new Date(n.createdAt), 'MMM dd — HH:mm')}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Pagination Box */}
            <div className="flex items-center justify-between px-4 py-4 bg-[#051330]/40 border-t border-[#13367c]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-xs font-semibold text-blue-200 hover:bg-[#13367c] hover:text-white disabled:opacity-20"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>

              <div className="text-xs font-medium text-blue-200/50 sm:block hidden">
                Showing page {page} of {totalPages}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="text-xs font-semibold text-blue-200 hover:bg-[#13367c] hover:text-white disabled:opacity-20"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}