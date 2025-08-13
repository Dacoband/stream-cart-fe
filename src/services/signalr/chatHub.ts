import { HubConnection, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions, LogLevel } from '@microsoft/signalr';

// Event payload typings
export interface LivestreamMessagePayload {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string; // ISO string from server
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

  async ensureStarted() {
    const conn = await this.getConnection();
    if (conn.state === HubConnectionState.Disconnected) {
      await conn.start();
    }
    return conn;
  }

  async joinLivestream(livestreamId: string) {
    const conn = await this.ensureStarted();
    await conn.invoke('JoinLivestreamChatRoom', livestreamId);
  }

  async leaveLivestream(livestreamId: string) {
    if (!this.connection) return;
    if (this.connection.state === HubConnectionState.Connected) {
      try { await this.connection.invoke('LeaveLivestreamChatRoom', livestreamId); } catch {}
    }
  }

  async sendLivestreamMessage(livestreamId: string, message: string) {
    const conn = await this.ensureStarted();
    await conn.invoke('SendMessageToLivestream', livestreamId, message);
  }

  onReceiveLivestreamMessage(cb: (payload: LivestreamMessagePayload) => void) {
    this.connection?.off('ReceiveLivestreamMessage');
    this.connection?.on('ReceiveLivestreamMessage', cb);
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
    this.connection?.on('ReceiveViewerStats', cb);
  }
}

export const chatHubService = new ChatHubService();
