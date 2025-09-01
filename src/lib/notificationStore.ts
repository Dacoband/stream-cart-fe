// stores/notificationStore.ts
'use client'

import { DetailNotificationDTO } from '@/types/notification/notification'
import { create } from 'zustand'

type State = {
  notifications: DetailNotificationDTO[]
  unreadCount: number
}

type Actions = {
  addIncoming: (n: DetailNotificationDTO) => void
  markAllRead: () => void
  setUnreadCount: (num: number) => void
  setList: (list: DetailNotificationDTO[]) => void // ⬅️ NEW
}

export const useNotificationStore = create<State & Actions>((set) => ({
  notifications: [],
  unreadCount: 0,

  addIncoming: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + (n.isRead ? 0 : 1),
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((x) => ({ ...x, isRead: true })),
      unreadCount: 0,
    })),

  setUnreadCount: (num) => set({ unreadCount: num }),

  setList: (list) => set({ notifications: list }), // ⬅️ NEW
}))
