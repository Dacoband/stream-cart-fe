// lib/signalr/notificationHub.ts
'use client'

import { useNotificationStore } from '@/lib/notificationStore'
import { DetailNotificationDTO } from '@/types/notification/notification'
import * as signalR from '@microsoft/signalr'
import { toast } from 'sonner'

const HUB_URL =
  process.env.NEXT_PUBLIC_SIGNALR_HUB_URL ||
  'https://brightpa.me/hubs/notification'

let connection: signalR.HubConnection | null = null

export const startNotificationHub = async (accessToken?: string) => {
  if (connection) return connection

  connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => accessToken || '',
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect()
    // disable SignalR internal logging to avoid noisy console errors
    .configureLogging(signalR.LogLevel.None)
    .build()

  // Lắng nghe sự kiện từ server
  connection.on('ReceiveNotification', (payload: DetailNotificationDTO) => {
    // 1) Cập nhật store
    useNotificationStore.getState().addIncoming(payload)

    // 2) Hiển thị toast
    toast(payload.message, {
      action: payload.linkUrl
        ? {
            label: 'Xem',
            onClick: () => {
              window.location.href = payload.linkUrl as string
            },
          }
        : undefined,
      description: payload.created
        ? new Date(payload.created).toLocaleString()
        : undefined,
    })
  })

  try {
    await connection.start()
    // only minimal non-error logging kept
    if (process.env.NODE_ENV !== 'production') {
      // use debug instead of error so it's less intrusive
      console.debug('✅ SignalR connected.')
    }
  } catch (err) {
    // suppress negotiation/fetch errors completely (no console output)
    console.error('SignalR connection error:', err)
    try {
      await connection.stop()
    } catch {}
    connection = null
  }

  return connection
}

export const stopNotificationHub = async () => {
  if (connection) {
    await connection.stop()
    connection = null
    if (process.env.NODE_ENV !== 'production') {
      console.debug('🔌 SignalR disconnected.')
    }
  }
}
