"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { signalRChatClient } from "../services/signalr/signalrChatClient";
import chatApi from "../services/api/chat/chatApiService";
import { mapSignalRToChatMessage } from "./chatHelpers";
import { ChatMessage } from "../types/chat/chat";

type ChatContextShape = {
  messages: ChatMessage[];
  currentRoomId: string | null;
  sendMessage: (content: string) => Promise<void>;
  setTyping: (isTyping: boolean) => Promise<void>;
  connected: boolean;
};

const ChatContext = createContext<ChatContextShape | undefined>(undefined);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};

export const ChatProvider: React.FC<
  { shopId?: string } & React.PropsWithChildren
> = ({ shopId, children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const typingTimeout = useRef<number | null>(null);
  const currentRoomRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  const makeSignature = (m: Partial<ChatMessage>) => {
    const room = String(m.chatRoomId ?? "");
    const sender = String(m.senderUserId ?? "");
    const content = String(m.content ?? "").trim();
    const sentAt = String(m.sentAt ?? "").slice(0, 19);
    return `${room}|${sender}|${content}|${sentAt}`;
  };

  const isMillisId = (id?: string) => !!id && /^\d{13}$/.test(id);
  const toTime = (s?: string) => Date.parse(s ?? "") || 0;
  const within = (t1: number, t2: number, windowMs = 15000) =>
    Math.abs(t1 - t2) <= windowMs;

  useEffect(() => {
    const onReceive = (data: Record<string, unknown>) => {
      const mm = mapSignalRToChatMessage(data);
      if (
        typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_DEBUG_API === "true"
      ) {
        console.debug(
          "[ChatProvider] onReceive raw",
          data,
          "mapped",
          mm,
          "currentRoom",
          currentRoomRef.current
        );
      }
      // mark isMine if senderUserId equals stored user id
      const uid = currentUserIdRef.current;
      mm.isMine = !!(
        uid &&
        mm.senderUserId &&
        String(mm.senderUserId) === String(uid)
      );

      // dedupe by id, signature, or time-window similarity; replace fallback ids when possible
      const sig = makeSignature(mm);
      const mmTime = toTime(mm.sentAt);
      setMessages((prev) => {
        // exact id match
        if (mm.id && prev.some((p) => p.id === mm.id)) return prev;

        // signature match (same second)
        const sigIdx = prev.findIndex((p) => makeSignature(p) === sig);
        if (sigIdx >= 0) {
          // if existing has fallback millis id and incoming has a better id, replace
          if (isMillisId(prev[sigIdx].id) && mm.id && !isMillisId(mm.id)) {
            const copy = [...prev];
            copy[sigIdx] = mm;
            return copy;
          }
          return prev; // already present logically
        }

        // time-window duplicate: same sender+content and within 15s
        const approxIdx = prev.findIndex(
          (p) =>
            String(p.senderUserId ?? "") === String(mm.senderUserId ?? "") &&
            String(p.content ?? "").trim() ===
              String(mm.content ?? "").trim() &&
            within(toTime(p.sentAt), mmTime)
        );
        if (approxIdx >= 0) {
          // prefer the one with a non-fallback id
          const existing = prev[approxIdx];
          const incomingBetter =
            mm.id && (!isMillisId(mm.id) || isMillisId(existing.id));
          if (incomingBetter) {
            const copy = [...prev];
            copy[approxIdx] = mm;
            return copy;
          }
          return prev; // keep existing
        }

        return [...prev, mm];
      });
    };

    signalRChatClient.onReceiveMessage = onReceive;
    signalRChatClient.onUserJoined = (d) => console.log("UserJoined", d);
    signalRChatClient.onUserLeft = (d) => console.log("UserLeft", d);
    signalRChatClient.onUserTyping = (d) =>
      console.log("UserTyping", d as { userId?: string; isTyping?: boolean });
    // reflect connection state + auto rejoin on reconnect
    signalRChatClient.onConnected = () => setConnected(true);
    signalRChatClient.onReconnecting = () => setConnected(false);
    signalRChatClient.onReconnected = async () => {
      setConnected(true);
      // re-join the current room because SignalR groups don't persist across reconnects
      if (currentRoomRef.current) {
        try {
          await signalRChatClient.joinChatRoom(currentRoomRef.current);
        } catch (e) {
          console.warn("[ChatProvider] re-join after reconnect failed", e);
        }
      }
    };
    signalRChatClient.onConnectionClosed = () => setConnected(false);

    return () => {
      // cleanup
      signalRChatClient.onReceiveMessage = () => {};
    };
  }, []);

  useEffect(() => {
    // initialize: get/create room and connect
    const init = async () => {
      if (!shopId) return;

      try {
        // 1. initialize signalr early so websocket connects quickly
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") ?? undefined
            : undefined;
        const ok = await signalRChatClient.initializeConnection(token);
        setConnected(ok);

        // get current user id from localStorage (if available)
        let currentUserId: string | null = null;
        try {
          const raw =
            typeof window !== "undefined"
              ? localStorage.getItem("userData")
              : null;
          if (raw)
            currentUserId = (JSON.parse(raw) as { id?: string }).id ?? null;
        } catch {
          currentUserId = null;
        }
        currentUserIdRef.current = currentUserId;

        // 2. try get existing room for this user-shop pair
        let room = null;
        try {
          room = await chatApi.getChatRoomWithShop(shopId);
          // if backend returned a room, make sure it belongs to current user (defensive)
          if (
            room &&
            currentUserId &&
            String(room.userId) !== String(currentUserId)
          ) {
            // room exists but not for this user; treat as not found so we may create one for current user
            console.debug(
              "[ChatProvider] found room but belongs to different user, will create new for current user",
              { foundUserId: room.userId, currentUserId }
            );
            room = null;
          }
        } catch (e) {
          // ignore lookup failure for now
          console.debug("[ChatProvider] getChatRoomWithShop failed", e);
        }

        // Detect if current user is a shop account; only customers can create rooms
        let isShopUser = false;
        try {
          const raw =
            typeof window !== "undefined"
              ? localStorage.getItem("userData")
              : null;
          if (raw) {
            const ud = JSON.parse(raw) as Record<string, unknown>;
            // prefer explicit shopId presence (many shop accounts have shopId stored)
            if (ud.shopId || (ud.ShopId as unknown)) {
              isShopUser = true;
            } else {
              const role = (ud.role ?? ud.Role ?? ud.roleName ?? ud.Type) as
                | string
                | undefined;
              if (role && String(role).toLowerCase().includes("shop"))
                isShopUser = true;
            }
            // debug: show parsed userData to help troubleshoot role/shopId
            console.debug(
              "[ChatProvider] userData parsed for role/shopId detection",
              { role: ud.role ?? ud.Role, shopId: ud.shopId ?? ud.ShopId }
            );
          }
        } catch {
          isShopUser = false;
        }

        if (!room && !isShopUser) {
          // double-check in case of race / stale cache
          try {
            const existing = await chatApi.getChatRoomWithShop(shopId);
            if (existing) room = existing;
          } catch {
            // ignore
          }

          if (!room) {
            // double-check one more time
            try {
              const existing = await chatApi.getChatRoomWithShop(shopId);
              if (existing) room = existing;
            } catch {
              // ignore
            }
          }

          if (!room) {
            // only create a room when the current user is a customer
            console.debug("[ChatProvider] creating chat room", {
              shopId,
              currentUserId,
            });
            room = await chatApi.createChatRoom(shopId, null, "Xin chào");
          }
        }

        if (room) {
          setCurrentRoomId(room.id);
          currentRoomRef.current = room.id;

          // load messages
          const msgs = await chatApi.getChatMessages(room.id, 1, 50);
          const normalized = (msgs.items ?? []).map((m: unknown) => {
            const rec = m as Record<string, unknown>;
            const mapped = mapSignalRToChatMessage(rec);
            // ensure chatRoomId present
            if (!mapped.chatRoomId)
              mapped.chatRoomId =
                (rec["chatRoomId"] as string) ??
                (rec["roomId"] as string) ??
                room.id;
            // ensure id fallback
            if (!mapped.id)
              mapped.id =
                (rec["id"] as string) ??
                (rec["_id"] as string) ??
                `${Date.now()}`;
            mapped.isMine = !!(
              currentUserId &&
              mapped.senderUserId &&
              String(mapped.senderUserId) === String(currentUserId)
            );
            return mapped as ChatMessage;
          });
          normalized.sort((a, b) => {
            const ta = Date.parse(a.sentAt ?? "") || 0;
            const tb = Date.parse(b.sentAt ?? "") || 0;
            return ta - tb;
          });
          setMessages(normalized);

          // join via signalr if connected
          if (ok) {
            try {
              const joined = await signalRChatClient.joinChatRoom(room.id);
              if (
                typeof window !== "undefined" &&
                process.env.NEXT_PUBLIC_DEBUG_API === "true"
              )
                console.debug("[ChatProvider] signalR joinChatRoom", {
                  roomId: room.id,
                  joined,
                });
            } catch (e) {
              console.error("[ChatProvider] signalR joinChatRoom failed", e);
            }
            try {
              const restJoin = await chatApi.joinSignalRChatRoom(room.id);
              if (
                typeof window !== "undefined" &&
                process.env.NEXT_PUBLIC_DEBUG_API === "true"
              )
                console.debug("[ChatProvider] REST joinSignalRChatRoom", {
                  roomId: room.id,
                  restJoin,
                });
            } catch (e) {
              console.error(
                "[ChatProvider] REST joinSignalRChatRoom failed",
                e
              );
            }
          }
        }
      } catch (err) {
        console.error("Chat init failed", err);
      }
    };

    init();

    // start polling for new messages every 2s for the active room
    let pollId: number | null = null;
    const startPolling = () => {
      if (pollId) return;
      pollId = window.setInterval(async () => {
        try {
          if (!currentRoomRef.current) return;
          const resp = await chatApi.getChatMessages(
            currentRoomRef.current,
            1,
            50
          );
          const items = (resp.items ?? []).map((m: unknown) => {
            const rec = m as Record<string, unknown>;
            const mapped = mapSignalRToChatMessage(rec);
            if (!mapped.chatRoomId)
              mapped.chatRoomId =
                (rec["chatRoomId"] as string) ??
                (rec["roomId"] as string) ??
                currentRoomRef.current!;
            if (!mapped.id)
              mapped.id =
                (rec["id"] as string) ??
                (rec["_id"] as string) ??
                `${Date.now()}`;
            const uid = currentUserIdRef.current;
            mapped.isMine = !!(
              uid &&
              mapped.senderUserId &&
              String(mapped.senderUserId) === String(uid)
            );
            return mapped as ChatMessage;
          });
          // sort ascending
          items.sort(
            (a, b) =>
              (Date.parse(a.sentAt ?? "") || 0) -
              (Date.parse(b.sentAt ?? "") || 0)
          );
          // merge avoiding duplicates by id or signature
          setMessages((prev) => {
            const merged = [...prev];
            for (const it of items) {
              const itSig = makeSignature(it);
              const exactIdx = merged.findIndex((p) => p.id === it.id);
              if (exactIdx >= 0) continue;

              const sigIdx = merged.findIndex(
                (p) => makeSignature(p) === itSig
              );
              if (sigIdx >= 0) {
                // replace if existing has fallback millis id and incoming looks definitive
                if (
                  isMillisId(merged[sigIdx].id) &&
                  it.id &&
                  !isMillisId(it.id)
                ) {
                  merged[sigIdx] = it;
                }
                continue;
              }

              const approxIdx = merged.findIndex(
                (p) =>
                  String(p.senderUserId ?? "") ===
                    String(it.senderUserId ?? "") &&
                  String(p.content ?? "").trim() ===
                    String(it.content ?? "").trim() &&
                  within(toTime(p.sentAt), toTime(it.sentAt))
              );
              if (approxIdx >= 0) {
                // prefer the one with non-fallback id
                const existing = merged[approxIdx];
                const incomingBetter =
                  it.id && (!isMillisId(it.id) || isMillisId(existing.id));
                if (incomingBetter) merged[approxIdx] = it;
                continue;
              }

              merged.push(it);
            }
            merged.sort(
              (a, b) =>
                (Date.parse(a.sentAt ?? "") || 0) -
                (Date.parse(b.sentAt ?? "") || 0)
            );
            return merged;
          });
        } catch {
          // ignore polling errors
        }
      }, 2000) as unknown as number;
    };
    startPolling();
    return () => {
      // leave room
      if (currentRoomRef.current)
        signalRChatClient.leaveChatRoom(currentRoomRef.current);
      signalRChatClient.disconnect();
      if (pollId) window.clearInterval(pollId);
    };
  }, [shopId]);

  const sendMessage = async (content: string) => {
    if (!currentRoomId) return;
    try {
      if (
        typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_DEBUG_API === "true"
      )
        console.debug("[ChatProvider] sendMessage request (REST-first)", {
          roomId: currentRoomId,
          content,
          signalRConnected: signalRChatClient.isConnected,
        });
      // Use REST first to ensure the server stores and broadcasts the message to other participants.
      const res = await chatApi.sendMessage(currentRoomId, content, "Text");
      if (
        typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_DEBUG_API === "true"
      )
        console.debug("[ChatProvider] sendMessage via REST result", res);

      // Optionally also notify via SignalR to reduce perceived latency (non-blocking)
      if (signalRChatClient.isConnected) {
        try {
          const ok = await signalRChatClient.sendMessage(
            currentRoomId,
            content
          );
          if (
            typeof window !== "undefined" &&
            process.env.NEXT_PUBLIC_DEBUG_API === "true"
          )
            console.debug("[ChatProvider] notify via SignalR", {
              roomId: currentRoomId,
              ok,
            });
        } catch (e) {
          if (
            typeof window !== "undefined" &&
            process.env.NEXT_PUBLIC_DEBUG_API === "true"
          )
            console.debug("[ChatProvider] notify via SignalR failed", e);
        }
      }
    } catch (err) {
      console.error("sendMessage failed", err);
    }
  };

  const setTyping = async (isTyping: boolean) => {
    if (!currentRoomId) return;
    try {
      await signalRChatClient.setTypingStatus(currentRoomId, isTyping);
      if (isTyping) {
        if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
        // window.setTimeout returns number in browser
        typingTimeout.current = window.setTimeout(
          () =>
            signalRChatClient.setTypingStatus(
              currentRoomRef.current ?? "",
              false
            ),
          2000
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <ChatContext.Provider
      value={{ messages, currentRoomId, sendMessage, setTyping, connected }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
