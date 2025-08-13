import { HubConnection, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions, LogLevel } from '@microsoft/signalr';

// Event payload typings
export interface LivestreamMessagePayload {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  senderType?: string; // e.g., 'Shop' | 'User' | 'Moderator'
  senderAvatarUrl?: string;
}

export interface UserPresencePayload {
  userId: string;
  timestamp: string; // ISO string
}

export interface ViewerStatsPayload {
  livestreamId: string;
  totalViewers: number;
  viewersByRole: Record<string, number>;
  timestamp: string;
}

// Singleton manager for SignalR connection to Chat Hub
class ChatHubService {
  private connection: HubConnection | null = null;
  private connecting: Promise<HubConnection> | null = null;
  private readonly baseUrl = process.env.NEXT_PUBLIC_SIGNALR_BASE_URL;
  private readonly hubPath = '/signalrchat'; // adjust to actual hub path

  // Build a new connection
  private buildConnection(): HubConnection {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const options: IHttpConnectionOptions = {
      accessTokenFactory: token ? () => token : undefined,
      withCredentials: false,
    };

    return new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}${this.hubPath}`, options)
      .withAutomaticReconnect({ nextRetryDelayInMilliseconds: ctx => {
        if (!ctx) return 1000;
        if (ctx.previousRetryCount < 5) return 1000 * (ctx.previousRetryCount + 1);
        return 10000;
      }})
      .configureLogging(LogLevel.Information)
      .build();
  }

  async getConnection(): Promise<HubConnection> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return this.connection;
    }

    if (this.connecting) return this.connecting;

    this.connecting = new Promise<HubConnection>(async (resolve, reject) => {
      try {
        this.connection = this.buildConnection();

        this.connection.onclose(err => {
          console.warn('[SignalR] Connection closed', err);
        });
        this.connection.onreconnecting(err => {
          console.warn('[SignalR] Reconnecting...', err);
        });
        this.connection.onreconnected(id => {
          console.info('[SignalR] Reconnected', id);
        });

        await this.connection.start();
        resolve(this.connection);
      } catch (e) {
        this.connecting = null;
        reject(e);
      }
    });

    return this.connecting;
  }

  private sleep(ms: number) { return new Promise<void>(res => setTimeout(res, ms)); }

  private async waitForConnected(maxWaitMs = 8000): Promise<HubConnection> {
    let conn = await this.getConnection();
    const start = Date.now();
    while (true) {
      if (conn.state === HubConnectionState.Connected) return conn;
      if (conn.state === HubConnectionState.Disconnected) {
        try { await conn.start(); } catch { /* swallow and retry below */ }
      }
      if (Date.now() - start > maxWaitMs) {
        throw new Error('SignalR connection not connected within timeout');
      }
      await this.sleep(200);
      // refresh ref
      conn = this.connection ?? conn;
    }
  }

  async ensureStarted() {
    return this.waitForConnected(8000);
  }

  private async invokeWhenConnected<T = unknown>(method: string, ...args: unknown[]): Promise<T> {
    const conn = await this.waitForConnected(8000);
    // Type cast is safe as invoke is generic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (conn.invoke as any)(method, ...args);
  }

  async joinLivestream(livestreamId: string) {
    await this.invokeWhenConnected('JoinLivestreamChatRoom', livestreamId);
  }

  async startViewingLivestream(livestreamId: string) {
    await this.invokeWhenConnected('StartViewingLivestream', livestreamId);
  }

  async stopViewingLivestream(livestreamId: string) {
    try { await this.invokeWhenConnected('StopViewingLivestream', livestreamId); } catch { /* ignore */ }
  }

  async leaveLivestream(livestreamId: string) {
    if (!this.connection) return;
    if (this.connection.state === HubConnectionState.Connected) {
      try { await this.connection.invoke('LeaveLivestreamChatRoom', livestreamId); } catch {}
    }
  }

  async sendLivestreamMessage(livestreamId: string, message: string) {
    await this.invokeWhenConnected('SendMessageToLivestream', livestreamId, message);
  }

  onReceiveLivestreamMessage(cb: (payload: LivestreamMessagePayload) => void) {
    this.connection?.off('ReceiveLivestreamMessage');
    type RawMsg = {
      senderId: string;
      senderName: string;
      message: string;
      timestamp: string;
      senderType?: string; SenderType?: string;
      senderRole?: string; SenderRole?: string;
      senderAvatarUrl?: string; SenderAvatarUrl?: string;
      avatarUrl?: string; AvatarUrl?: string;
    };
    this.connection?.on('ReceiveLivestreamMessage', (raw: RawMsg) => {
      const payload: LivestreamMessagePayload = {
        senderId: raw.senderId,
        senderName: raw.senderName,
        message: raw.message,
        timestamp: raw.timestamp,
        senderType: raw.senderType ?? raw.SenderType ?? raw.senderRole ?? raw.SenderRole,
        senderAvatarUrl: raw.senderAvatarUrl ?? raw.SenderAvatarUrl ?? raw.avatarUrl ?? raw.AvatarUrl,
      };
      cb(payload);
    });
  }

  onUserJoined(cb: (payload: UserPresencePayload) => void) {
    this.connection?.off('UserJoined');
    this.connection?.on('UserJoined', cb);
  }

  onUserLeft(cb: (payload: UserPresencePayload) => void) {
    this.connection?.off('UserLeft');
    this.connection?.on('UserLeft', cb);
  }

  onViewerStats(cb: (payload: ViewerStatsPayload) => void) {
    this.connection?.off('ReceiveViewerStats');
    type RawStats = {
      livestreamId?: string; LivestreamId?: string;
      totalViewers?: number; TotalViewers?: number;
      viewersByRole?: Record<string, number>; ViewersByRole?: Record<string, number>;
      timestamp?: string; Timestamp?: string;
    };
    this.connection?.on('ReceiveViewerStats', (raw: RawStats) => {
      // Normalize server casing (LivestreamId, TotalViewers, ViewersByRole, Timestamp) -> camelCase
      const normalized: ViewerStatsPayload = {
        livestreamId: (raw?.livestreamId ?? raw?.LivestreamId ?? '').toString(),
        totalViewers: Number(raw?.totalViewers ?? raw?.TotalViewers ?? 0),
        viewersByRole: (raw?.viewersByRole ?? raw?.ViewersByRole ?? {}) as Record<string, number>,
        timestamp: (raw?.timestamp ?? raw?.Timestamp ?? new Date().toISOString()).toString(),
      };
      cb(normalized);
    });
  }
}

export const chatHubService = new ChatHubService();
