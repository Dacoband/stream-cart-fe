import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState } from '@microsoft/signalr';

export type ReceiveMessagePayload = {
  messageId?: string;
  chatRoomId?: string;
  senderId?: string;
  senderName?: string;
  message?: string;
  content?: string;
  timestamp?: string;
  isTyping?: boolean;
};

class SignalRChatClient {
  private baseUrl: string;
  private accessToken?: string;
  private connection: HubConnection | null = null;
  public isConnected = false;
  // guard concurrent starts (StrictMode mounts, fast re-renders)
  private starting: Promise<void> | null = null;

  // helpers to avoid TS union narrowing issues when comparing enum values
  private getState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }
  private isConnectedState(s: HubConnectionState) {
    return s === HubConnectionState.Connected;
  }
  private isStableState(s: HubConnectionState) {
    // "stable" means either fully connected or fully disconnected
    return s === HubConnectionState.Connected || s === HubConnectionState.Disconnected;
  }

  // event callbacks
  public onReceiveMessage: (data: ReceiveMessagePayload) => void = () => {};
  public onUserJoined: (data: Record<string, unknown>) => void = () => {};
  public onUserLeft: (data: Record<string, unknown>) => void = () => {};
  public onUserTyping: (data: { userId?: string; chatRoomId?: string; isTyping?: boolean }) => void = () => {};
  // additional optional callbacks (compatibility with other client implementations)
  public onConnected?: (data: Record<string, unknown>) => void;
  public onReceiveChatMessage?: (data: ReceiveMessagePayload) => void;
  public onError?: (err: unknown) => void;
  public onReconnecting?: (err?: Error) => void;
  public onReconnected?: (connectionId?: string) => void;
  public onConnectionClosed?: (error?: Error) => void;

  constructor(baseUrl?: string, accessToken?: string) {
    this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    // store provided token (may be raw or prefixed with 'Bearer '); normalization will be applied when building the connection
    this.accessToken = accessToken ?? (typeof window !== 'undefined' ? localStorage.getItem('token') ?? undefined : undefined);
  }

  private normalizeToken(raw?: string | null | undefined) {
    if (!raw) return undefined;
    try {
      const s = String(raw).replace(/^"|"$/g, '').trim();
      // strip optional Bearer prefix if present
      return s.replace(/^(?:Bearer\s+)/i, '');
    } catch {
      return undefined;
    }
  }

  private buildConnection() {
    // Backend exposes the SignalR hub at the root '/signalrchat' (not under /api)
    // If NEXT_PUBLIC_API_BASE_URL contains '/api', strip it before appending the hub path.
    const apiBase = this.baseUrl.replace(/\/$/, '');
  const signalRBase = apiBase.replace(/\/api\/?$/i, '');
    const hubUrl = `${signalRBase}/signalrchat`;
  // log for debugging during development
  console.info('[SignalR] hubUrl ->', hubUrl);

  return new HubConnectionBuilder()
      .withUrl(hubUrl, {
        // Read the token at call time so navigation right after login picks it up without rebuild
        accessTokenFactory: () => {
          const latest = this.normalizeToken(this.accessToken ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : undefined));
          if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
            const masked = latest ? `${String(latest).slice(0,12)}...` : '<no-token>';
            try { console.debug('[SignalR] accessTokenFactory ->', masked); } catch {}
          }
          return latest ?? '';
        },
        transport: HttpTransportType.WebSockets,
        // avoid sending browser credentials (cookies) on negotiate/fetch
        // this prevents CORS failures when the server does not set Access-Control-Allow-Credentials
        withCredentials: false,
        skipNegotiation: false,
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();
  }

  public async initializeConnection(token?: string) {
    if (token) this.accessToken = token;
    // create connection lazily
    if (!this.connection) {
      this.connection = this.buildConnection();
      this.setupEventHandlers();
    }

    // already connected
  if (this.isConnectedState(this.getState())) {
      this.isConnected = true;
      return true;
    }

    // start already in progress — await the same promise
    if (this.starting) {
      try {
        await this.starting;
        this.isConnected = this.connection?.state === HubConnectionState.Connected;
        return this.isConnected;
      } catch (err) {
        console.error('SignalR concurrent start failed', err);
        this.isConnected = false;
        return false;
      }
    }

    // kick off a single start attempt
    this.starting = (async () => {
      // if currently disconnecting/reconnecting/connecting, wait a tick
      if (this.connection && !this.isStableState(this.getState())) {
        // do NOT call stop() while start is in progress; just wait for state changes
        let spins = 0;
        while (!this.isStableState(this.getState()) && spins < 30) {
          await new Promise((r) => setTimeout(r, 100));
          spins++;
        }
        if (this.isConnectedState(this.getState())) return; // someone else connected
      }

      // If connection object was disposed, rebuild
      if (!this.connection) {
        this.connection = this.buildConnection();
        this.setupEventHandlers();
      }

      try {
        await this.connection.start();
      } catch (err) {
        console.error('SignalR init failed', err);
        // quick single retry after short delay without stopping concurrently
        await new Promise((res) => setTimeout(res, 400));
        try {
          await this.connection.start();
        } catch (e2) {
          console.error('SignalR retry failed', e2);
          throw e2;
        }
      }
    })();

    try {
      await this.starting;
  this.isConnected = this.isConnectedState(this.getState());
      return this.isConnected;
    } finally {
      this.starting = null;
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // clear previous handlers to avoid duplicates
    try { this.connection.off('ReceiveChatMessage'); } catch {
      /* ignore */
    }
    try { this.connection.off('UserJoined'); } catch { /* ignore */ }
    try { this.connection.off('UserLeft'); } catch { /* ignore */ }
    try { this.connection.off('UserTyping'); } catch { /* ignore */ }

    this.connection.on('ReceiveChatMessage', (data: ReceiveMessagePayload) => {
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
        try { console.debug('[SignalR] ReceiveChatMessage raw', data); } catch { /* ignore */ }
      }
      this.onReceiveMessage(data);
      if (this.onReceiveChatMessage) this.onReceiveChatMessage(data);
    });

    // optional server confirmation that connection is established
    try { this.connection.off('Connected'); } catch { /* ignore */ }
    this.connection.on('Connected', (data: Record<string, unknown>) => {
      if (this.onConnected) this.onConnected(data);
    });

    this.connection.on('UserJoined', (data: Record<string, unknown>) => this.onUserJoined(data));
    this.connection.on('UserLeft', (data: Record<string, unknown>) => this.onUserLeft(data));
    this.connection.on('UserTyping', (data: { userId?: string; chatRoomId?: string; isTyping?: boolean }) => this.onUserTyping(data));

    this.connection.onreconnecting((error) => {
      console.warn('SignalR reconnecting', error);
      this.isConnected = false;
      if (this.onReconnecting) this.onReconnecting(error instanceof Error ? error : undefined);
    });

    this.connection.onreconnected((connectionId) => {
      console.info('SignalR reconnected', connectionId);
      this.isConnected = true;
      if (this.onReconnected) this.onReconnected(connectionId);
    });

    this.connection.onclose((error) => {
      console.warn('SignalR closed', error);
      this.isConnected = false;
      if (this.onConnectionClosed) this.onConnectionClosed(error instanceof Error ? error : undefined);
    });

    // global error event from server hub
    try { this.connection.off('Error'); } catch { /* ignore */ }
    this.connection.on('Error', (err: unknown) => {
      console.error('SignalR Hub Error', err);
      if (this.onError) this.onError(err);
    });
  }

  private async ensureConnected() {
    await this.initializeConnection();
  }

  public async joinChatRoom(chatRoomId: string) {
    await this.ensureConnected();
  if (!this.connection || !this.isConnectedState(this.getState())) return false;
    try {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[SignalR] invoking JoinDirectChatRoom', { chatRoomId });
  await this.connection.invoke('JoinDirectChatRoom', chatRoomId);
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[SignalR] JoinDirectChatRoom success', { chatRoomId });
  return true;
    } catch (err) {
  console.error('JoinDirectChatRoom failed', err);
      return false;
    }
  }

  public async leaveChatRoom(chatRoomId: string) {
    if (!this.connection || !this.isConnected) return;
    try {
      await this.connection.invoke('LeaveDirectChatRoom', chatRoomId);
    } catch (err) {
      console.error('LeaveDirectChatRoom failed', err);
    }
  }

  public async sendMessage(chatRoomId: string, message: string) {
    if (!this.connection || !this.isConnected) return false;
    try {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[SignalR] invoking SendMessageToChatRoom', { chatRoomId, messagePreview: String(message).slice(0,100) });
  await this.connection.invoke('SendMessageToChatRoom', chatRoomId, message);
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_API === 'true') console.debug('[SignalR] SendMessageToChatRoom success', { chatRoomId });
  return true;
    } catch (err) {
  console.error('SendMessageToChatRoom failed', err);
      return false;
    }
  }

  public async setTypingStatus(chatRoomId: string, isTyping: boolean) {
    if (!this.connection || !this.isConnected) return;
    try {
      await this.connection.invoke('SetTypingStatus', chatRoomId, isTyping);
    } catch (err) {
      console.error('SetTypingStatus failed', err);
    }
  }

  public async disconnect() {
    if (!this.connection) return;
    try {
      // avoid calling stop while a start is in-flight
      if (this.starting) {
        try { await this.starting; } catch { /* ignore */ }
      }
      await this.connection.stop();
    } catch {
      // ignore
    } finally {
      this.isConnected = false;
      this.connection = null;
      this.starting = null;
    }
  }
}

export const signalRChatClient = new SignalRChatClient();

export default SignalRChatClient;
