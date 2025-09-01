// components/NotificationDropdown.tsx
'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck, ExternalLink, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { fetchMyNotifications } from '@/services/api/notification/notification'
import { useNotificationStore } from '@/lib/notificationStore' // đảm bảo đúng path

type Props = { children: React.ReactNode }

export default function NotificationDropdown({ children }: Props) {
  const router = useRouter()

  // ✅ dùng selector + fallback
  const notifications = useNotificationStore((s) => s.notifications) ?? []
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const setList = useNotificationStore((s) => s.setList)

  const [open, setOpen] = useState(false)
  const loadedRef = useRef(false)

  const handleOpenChange = async (v: boolean) => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (v && !token) {
      toast.error('Vui lòng đăng nhập.')
      router.push(
        `/authentication/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`
      )
      return
    }
    setOpen(v)

    // Lần đầu mở: tải lịch sử
    if (v && !loadedRef.current) {
      try {
        if (!token) return
        const listRes = await fetchMyNotifications({
          PageIndex: 1,
          PageSize: 20,
        })
        console.log(listRes.data.notificationList)
        setList(listRes.data?.notificationList ?? [])
        loadedRef.current = true
      } catch (e) {
        console.error('Load notifications failed:', e)
      }
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      // gọi endpoint mark-all-read (dùng rootApi của bạn nếu không có proxy)
      const { default: rootApi } = await import('@/services/rootApi')
      await rootApi.post('notifications/mark-all-read', null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      markAllRead()
    } catch (e) {
      console.error(e)
    }
  }

  const goIfLink = (linkUrl?: string | null) => {
    if (!linkUrl) return
    setOpen(false)
    router.push(linkUrl)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent className="w-[380px] p-0 overflow-hidden" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
          <div className="font-semibold">Thông báo</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-2"
          >
            <CheckCheck size={16} />
            Đánh dấu đã đọc
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-muted-foreground">
            <Inbox className="w-8 h-8 mb-2" />
            Chưa có thông báo
          </div>
        ) : (
          <ScrollArea className="max-h-[420px]">
            <ul className="divide-y">
              {notifications.map((n) => (
                <li
                  key={n.notificationId}
                  className={cn(
                    'px-4 py-3 hover:bg-muted/50 cursor-pointer group',
                    !n.isRead && 'bg-muted/30'
                  )}
                  onClick={() => goIfLink(n.linkUrl)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-1 w-2.5 h-2.5 rounded-full',
                        n.isRead
                          ? 'bg-transparent border border-muted'
                          : 'bg-emerald-500'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium line-clamp-2">
                        {n.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {n.type}
                        {n.created && (
                          <> • {new Date(n.created).toLocaleString()}</>
                        )}
                      </div>
                      {n.linkUrl && (
                        <div className="flex items-center gap-1 text-xs text-primary mt-1 opacity-0 group-hover:opacity-100">
                          Xem chi tiết <ExternalLink size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
