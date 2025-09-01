// lib/NotificationContext.tsx (ví dụ)
'use client'

import { useEffect } from 'react'
import {
  startNotificationHub,
  stopNotificationHub,
} from '@/services/signalr/notificationHub'
import { useNotificationStore } from './notificationStore'
import { fetchMyNotifications } from '@/services/api/notification/notification'

export default function NotificationsProvider() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') || undefined
        : undefined
    startNotificationHub(token)

    const syncUnread = async () => {
      try {
        if (!token) return

        const res = await fetchMyNotifications({
          PageIndex: 1,
          PageSize: 100,
          IsRead: false,
        })
        console.log(res)
        const total = Number(res?.data?.totalItem ?? 0) || 0
        setUnreadCount(total)
      } catch {}
    }
    syncUnread()

    return () => {
      stopNotificationHub()
    }
  }, [setUnreadCount])

  return null
}
