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
  customerViewers?: number;
  maxCustomerViewer?: number;
  isNewRecord?: boolean;
}

// Product-related typings (normalized to camelCase as much as possible)
export interface ProductEventBase {
  livestreamId: string;
  productId?: string;
  variantId?: string | null;
  productName?: string;
  price?: number;
  originalPrice?: number;
  stock?: number;
  timestamp?: string;
  message?: string;
  updatedBy?: string;
}

export interface ProductAddedEvent {
  livestreamId: string;
  product: unknown; 
  addedBy?: string;
  timestamp?: string;
  message?: string;
}

export interface ProductPinStatusChangedEvent extends ProductEventBase {
  isPin: boolean;
}

export interface ProductStockUpdatedEvent extends ProductEventBase {
  newStock?: number;
}

export interface PinnedProductsUpdatedEvent {
  livestreamId: string;
  pinnedProducts: unknown[];
  timestamp?: string;
  count?: number;
}

export interface LivestreamProductsLoadedPayload {
  livestreamId: string;
  products: unknown[];
  timestamp?: string;
  count?: number;
}

// Singleton manager for SignalR connection to Chat Hub
class ChatHubService {
  private connection: HubConnection | null = null;
  private connecting: Promise<HubConnection> | null = null;
  private readonly baseUrl = process.env.NEXT_PUBLIC_SIGNALR_BASE_URL;
  private readonly hubPath = '/signalrchat'; // adjust to actual hub path
  // Track unique viewers per livestream using UserJoined events
  private uniqueViewersByLive = new Map<string, Set<string>>();
  private lastViewerStatsByLive = new Map<string, ViewerStatsPayload>();
  private peakCustomerByLive = new Map<string, number>();
  // simple de-dupe/throttle maps for pin operations
  private inflightPins = new Set<string>();
  private lastPinAt = new Map<string, number>();

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

        // Pre-register common server events (case-insensitive variants) to avoid warning spam
        try {
          const c = this.connection;
          // server might emit lowercased names
          c.on('connected', () => {});
          c.on('Connected', () => {});
          c.on('receiveviewerstats', () => {});
          c.on('userjoined', () => {});
          c.on('livestreamproductsloaded', () => {});
          c.on('pinnedproductsupdated', () => {});
          c.on('livestreamproductstockupdated', () => {});
          c.on('livestreamproductupdated', () => {});
          c.on('livestreamproductdeleted', () => {});
          c.on('productstockupdated', () => {});
          c.on('stockchanged', () => {});
          c.on('error', () => {});
          c.on('updatesuccess', (payload) => {
            console.log('[DEBUG] ✅ updatesuccess event received:', payload);
          });
          c.on('UpdateSuccess', (payload) => {
            console.log('[DEBUG] ✅ UpdateSuccess event received:', payload);
          });
        } catch {
          /* ignore */
        }

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

  // ---------- helpers ----------
  private toStr(v: unknown): string | undefined {
    if (v === undefined || v === null) return undefined;
    const s = String(v);
    return s.length ? s : undefined;
  }
  private toNum(v: unknown): number | undefined {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  private toBool(v: unknown): boolean | undefined {
    if (v === undefined || v === null) return undefined;
    return Boolean(v);
  }
  private getArrayField(obj: Record<string, unknown>, ...keys: string[]): unknown[] {
    for (const k of keys) {
      const val = (obj as Record<string, unknown>)[k];
      if (Array.isArray(val)) return val as unknown[];
    }
    return [] as unknown[];
  }

  private async invokeWhenConnected<T = unknown>(method: string, ...args: unknown[]): Promise<T> {
    console.log("[DEBUG] invokeWhenConnected called with method:", method, "args:", args);
    const conn = await this.waitForConnected(8000);
    // Type cast is safe as invoke is generic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (conn.invoke as any)(method, ...args);
    console.log("[DEBUG] invokeWhenConnected result for", method, ":", result);
    return result;
  }

  async joinLivestream(livestreamId: string) {
    console.log("[DEBUG] chatHub.joinLivestream called with:", livestreamId);
    console.log(`[DEBUG]  Should join group: livestream_${livestreamId}`);
    const result = await this.invokeWhenConnected('JoinLivestreamChatRoom', livestreamId);
    console.log("[DEBUG] joinLivestream result:", result);
    return result;
  }

  async startViewingLivestream(livestreamId: string) {
    console.log("[DEBUG] chatHub.startViewingLivestream called with:", livestreamId);
    const result = await this.invokeWhenConnected('StartViewingLivestream', livestreamId);
    console.log("[DEBUG] startViewingLivestream result:", result);
    console.log(`[DEBUG]  Viewer should now be in group: livestream_viewers_${livestreamId}`);
    
    // Add debugging for group membership verification
    setTimeout(async () => {
      console.log('[DEBUG]  Checking if viewer is properly in group after 2 seconds...');
      try {
        await this.invokeWhenConnected('VerifyGroupMembership', livestreamId);
      } catch (error) {
        console.log('[DEBUG]  Group membership verification failed:', error);
      }
    }, 2000);
    
    return result;
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
  this.connection?.off('receivelivestreammessage' as unknown as string);
    type RawMsg = {
      // Backend sends PascalCase, but we handle both
      senderId?: string; SenderId?: string;
      senderName?: string; SenderName?: string;
      message?: string; Message?: string;
      timestamp?: string; Timestamp?: string;
      senderType?: string; SenderType?: string;
      senderRole?: string; SenderRole?: string;
      senderAvatarUrl?: string; SenderAvatarUrl?: string;
      avatarUrl?: string; AvatarUrl?: string;
    };
  const handler = (raw: RawMsg) => {
    console.log('[DEBUG] onReceiveLivestreamMessage received:', raw);
    const payload: LivestreamMessagePayload = {
      senderId: raw.senderId ?? raw.SenderId ?? '',
      senderName: raw.senderName ?? raw.SenderName ?? '',
      message: raw.message ?? raw.Message ?? '',
      timestamp: raw.timestamp ?? raw.Timestamp ?? new Date().toISOString(),
      senderType: raw.senderType ?? raw.SenderType ?? (raw.senderName === '🤖 Hệ thống' ? 'System' : undefined),
      senderAvatarUrl: raw.senderAvatarUrl ?? raw.SenderAvatarUrl ?? raw.avatarUrl ?? raw.AvatarUrl,
    };
    console.log('[DEBUG] onReceiveLivestreamMessage processed payload:', payload);
    cb(payload);
  };
  this.connection?.on('ReceiveLivestreamMessage', handler as unknown as (...args: never[]) => void);
  this.connection?.on('receivelivestreammessage' as unknown as string, handler as unknown as (...args: never[]) => void);
  }

  onNewLivestreamMessage(cb: (payload: LivestreamMessagePayload) => void) {
    this.connection?.off('NewLivestreamMessage');
    this.connection?.off('newlivestreammessage' as unknown as string);
    type RawMsg = {
      messageId?: string; MessageId?: string;
      livestreamId?: string; LivestreamId?: string;
      senderName?: string; SenderName?: string;
      senderType?: string; SenderType?: string;  
      content?: string; Content?: string;
      timestamp?: string; Timestamp?: string;
    };
    const handler = (raw: RawMsg) => {
      console.log('[DEBUG] onNewLivestreamMessage received:', raw);
      const payload: LivestreamMessagePayload = {
        senderId: '', // System message
        senderName: raw.senderName ?? raw.SenderName ?? '',
        message: raw.content ?? raw.Content ?? '',
        timestamp: raw.timestamp ?? raw.Timestamp ?? new Date().toISOString(),
        senderType: raw.senderType ?? raw.SenderType ?? (raw.senderName === '🤖 Hệ thống' ? 'System' : 'System'),
      };
      console.log('[DEBUG] onNewLivestreamMessage processed payload:', payload);
      cb(payload);
    };
    this.connection?.on('NewLivestreamMessage', handler as unknown as (...args: never[]) => void);
    this.connection?.on('newlivestreammessage' as unknown as string, handler as unknown as (...args: never[]) => void);
    console.log('[DEBUG] onNewLivestreamMessage handlers registered');
  }

  onUserJoined(cb: (payload: UserPresencePayload) => void) {
  this.connection?.off('UserJoined');
  this.connection?.off('userjoined' as unknown as string);
  const handler = (payload: UserPresencePayload) => cb(payload);
  this.connection?.on('UserJoined', handler as unknown as (...args: never[]) => void);
  this.connection?.on('userjoined' as unknown as string, handler as unknown as (...args: never[]) => void);
  }

  onUserLeft(cb: (payload: UserPresencePayload) => void) {
    this.connection?.off('UserLeft');
    this.connection?.on('UserLeft', cb);
  }

  onViewerStats(cb: (payload: ViewerStatsPayload) => void) {
  this.connection?.off('ReceiveViewerStats');
  this.connection?.off('receiveviewerstats' as unknown as string);
    type RawStats = {
      livestreamId?: string; LivestreamId?: string;
      totalViewers?: number; TotalViewers?: number;
      viewersByRole?: Record<string, number>; ViewersByRole?: Record<string, number>;
      timestamp?: string; Timestamp?: string;
      customerViewers?: number; CustomerViewers?: number;
      maxCustomerViewer?: number; MaxCustomerViewer?: number;
      isNewRecord?: boolean; IsNewRecord?: boolean;
    };
  const handler = (raw: RawStats) => {
      // Normalize server casing (LivestreamId, TotalViewers, ViewersByRole, Timestamp) -> camelCase
      const normalized: ViewerStatsPayload = {
        livestreamId: (raw?.livestreamId ?? raw?.LivestreamId ?? '').toString(),
        totalViewers: Number(raw?.totalViewers ?? raw?.TotalViewers ?? 0),
        viewersByRole: (raw?.viewersByRole ?? raw?.ViewersByRole ?? {}) as Record<string, number>,
        timestamp: (raw?.timestamp ?? raw?.Timestamp ?? new Date().toISOString()).toString(),
        customerViewers: Number(raw?.customerViewers ?? raw?.CustomerViewers ?? NaN),
        maxCustomerViewer: Number(raw?.maxCustomerViewer ?? raw?.MaxCustomerViewer ?? NaN),
        isNewRecord: Boolean(raw?.isNewRecord ?? raw?.IsNewRecord),
      };
      // Track last and peak values
      if (normalized.livestreamId) {
        this.lastViewerStatsByLive.set(normalized.livestreamId, normalized);
        const currPeak = this.peakCustomerByLive.get(normalized.livestreamId) ?? 0;
        const nextPeak = Math.max(
          currPeak,
          Number.isFinite(normalized.maxCustomerViewer ?? NaN)
            ? (normalized.maxCustomerViewer as number)
            : (normalized.customerViewers ?? 0)
        );
        this.peakCustomerByLive.set(normalized.livestreamId, nextPeak);
      }
      cb(normalized);
  };
  this.connection?.on('ReceiveViewerStats', handler as unknown as (...args: never[]) => void);
  this.connection?.on('receiveviewerstats' as unknown as string, handler as unknown as (...args: never[]) => void);
  }

  // ---------- Product: invoke hub methods ----------
  async updateProductStock(livestreamId: string, productId: string, variantId: string | null, newStock: number) {
    return this.invokeWhenConnected('UpdateProductStock', livestreamId, productId, variantId, newStock);
  }

  async pinProduct(livestreamId: string, productId: string, variantId: string | null, isPin: boolean) {
    const key = `${livestreamId}|${productId}|${variantId ?? ''}`;
    if (this.inflightPins.has(key)) return;
    const last = this.lastPinAt.get(key) ?? 0;
    if (Date.now() - last < 600) return;
    this.inflightPins.add(key);
    try {
      return await this.invokeWhenConnected('PinProduct', livestreamId, productId, variantId, isPin);
    } finally {
      this.inflightPins.delete(key);
      this.lastPinAt.set(key, Date.now());
    }
  }

  async addProductToLivestream(
    livestreamId: string,
    productId: string,
    variantId: string | null,
    price: number,
    stock: number,
    isPin = false,
  ) {
    return this.invokeWhenConnected('AddProductToLivestream', livestreamId, productId, variantId, price, stock, isPin);
  }

  async removeProductFromLivestream(livestreamId: string, productId: string, variantId: string | null) {
    return this.invokeWhenConnected('RemoveProductFromLivestream', livestreamId, productId, variantId);
  }

  async getLivestreamProducts(livestreamId: string) {
    return this.invokeWhenConnected('GetLivestreamProducts', livestreamId);
  }

  async getPinnedProducts(livestreamId: string) {
    const key = `getPinned|${livestreamId}`;
    const last = this.lastPinAt.get(key) ?? 0;
    if (Date.now() - last < 1000) return []; // throttle to 1 second
    this.lastPinAt.set(key, Date.now());
    return this.invokeWhenConnected('GetPinnedProducts', livestreamId);
  }

  async updateLivestreamProductById(id: string, price: number, stock: number, isPin: boolean) {
    return this.invokeWhenConnected('UpdateLivestreamProductById', id, price, stock, isPin);
  }

  async pinLivestreamProductById(id: string, isPin: boolean) {
    const key = `byId|${id}`;
    if (this.inflightPins.has(key)) return;
    const last = this.lastPinAt.get(key) ?? 0;
    if (Date.now() - last < 600) return;
    this.inflightPins.add(key);
    try {
      return await this.invokeWhenConnected('PinLivestreamProductById', id, isPin);
    } finally {
      this.inflightPins.delete(key);
      this.lastPinAt.set(key, Date.now());
    }
  }

  async updateLivestreamProductStockById(id: string, newStock: number) {
    console.log("[DEBUG] updateLivestreamProductStockById called with id:", id, "newStock:", newStock);
    const result = await this.invokeWhenConnected('UpdateLivestreamProductStockById', id, newStock);
    console.log("[DEBUG] updateLivestreamProductStockById result:", result);
    return result;
  }

  // Add test method to broadcast to ALL connections (for debugging group issues)
  async testBroadcastToAll(livestreamId: string, message: string) {
    console.log('[DEBUG] 🧪 Testing broadcast to ALL connections:', { livestreamId, message });
    return await this.invokeWhenConnected('TestBroadcastToAll', livestreamId, message);
  }

  async deleteLivestreamProductById(id: string) {
    return this.invokeWhenConnected('DeleteLivestreamProductById', id);
  }

  async softDeleteLivestreamProductById(id: string, reason = 'Removed by seller') {
    return this.invokeWhenConnected('SoftDeleteLivestreamProductById', id, reason);
  }

  // ---------- Product: subscribe to server events ----------
  onProductStockUpdated(cb: (payload: ProductStockUpdatedEvent) => void) {
    this.connection?.off('ProductStockUpdated');
  this.connection?.on('ProductStockUpdated', (raw: Record<string, unknown>) => {
      const payload: ProductStockUpdatedEvent = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
    productId: this.toStr(raw?.ProductId ?? raw?.productId),
    variantId: this.toStr(raw?.VariantId ?? raw?.variantId) ?? null,
    originalPrice: this.toNum(raw?.OriginalPrice ?? raw?.originalPrice),
    price: this.toNum(raw?.Price ?? raw?.price),
    productName: this.toStr(raw?.ProductName ?? raw?.productName),
    updatedBy: this.toStr(raw?.UpdatedBy ?? raw?.updatedBy),
    newStock: this.toNum(raw?.NewStock ?? raw?.newStock),
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
      };
      cb(payload);
    });
  }

  onStockChanged(cb: (payload: ProductStockUpdatedEvent) => void) {
    this.connection?.off('StockChanged');
  this.connection?.on('StockChanged', (raw: Record<string, unknown>) => {
      const payload: ProductStockUpdatedEvent = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
    productId: this.toStr(raw?.ProductId ?? raw?.productId),
    variantId: this.toStr(raw?.VariantId ?? raw?.variantId) ?? null,
    originalPrice: this.toNum(raw?.OriginalPrice ?? raw?.originalPrice),
    price: this.toNum(raw?.Price ?? raw?.price),
    newStock: this.toNum(raw?.NewStock ?? raw?.newStock),
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
      };
      cb(payload);
    });
  }

  onProductPinStatusChanged(cb: (payload: ProductPinStatusChangedEvent) => void) {
    this.connection?.off('ProductPinStatusChanged');
  this.connection?.on('ProductPinStatusChanged', (raw: Record<string, unknown>) => {
      const payload: ProductPinStatusChangedEvent = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
    productId: this.toStr(raw?.ProductId ?? raw?.productId),
    variantId: this.toStr(raw?.VariantId ?? raw?.variantId) ?? null,
    originalPrice: this.toNum(raw?.OriginalPrice ?? raw?.originalPrice),
    price: this.toNum(raw?.Price ?? raw?.price),
    stock: this.toNum(raw?.Stock ?? raw?.stock),
    productName: this.toStr(raw?.ProductName ?? raw?.productName),
    updatedBy: this.toStr(raw?.UpdatedBy ?? raw?.updatedBy),
    isPin: this.toBool(raw?.IsPin ?? raw?.isPin) ?? false,
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
      };
      cb(payload);
    });
  }

  onProductAdded(cb: (payload: ProductAddedEvent) => void) {
    this.connection?.off('ProductAddedToLivestream');
  this.connection?.on('ProductAddedToLivestream', (raw: Record<string, unknown>) => {
      const payload: ProductAddedEvent = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
        product: raw?.Product ?? raw?.product,
    addedBy: this.toStr(raw?.AddedBy ?? raw?.addedBy),
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
      };
      cb(payload);
    });
  }

  onProductRemoved(cb: (payload: ProductEventBase) => void) {
    this.connection?.off('ProductRemovedFromLivestream');
  this.connection?.on('ProductRemovedFromLivestream', (raw: Record<string, unknown>) => {
      const payload: ProductEventBase = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
    productId: this.toStr(raw?.ProductId ?? raw?.productId),
    variantId: this.toStr(raw?.VariantId ?? raw?.variantId) ?? null,
    updatedBy: this.toStr(raw?.RemovedBy ?? raw?.removedBy),
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
      };
      cb(payload);
    });
  }

  onLivestreamProductUpdated(cb: (payload: ProductEventBase) => void) {
    this.connection?.off('LivestreamProductUpdated');
  this.connection?.on('LivestreamProductUpdated', (raw: Record<string, unknown>) => {
      const payload: ProductEventBase = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
    productId: this.toStr(raw?.ProductId ?? raw?.productId),
    variantId: this.toStr(raw?.VariantId ?? raw?.variantId) ?? null,
    productName: this.toStr(raw?.ProductName ?? raw?.productName),
    price: this.toNum(raw?.Price ?? raw?.price),
    stock: this.toNum(raw?.Stock ?? raw?.stock),
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
    updatedBy: this.toStr(raw?.UpdatedBy ?? raw?.updatedBy),
      };
      cb(payload);
    });
  }

  onLivestreamProductPinStatusChanged(cb: (payload: ProductPinStatusChangedEvent) => void) {
    this.connection?.off('LivestreamProductPinStatusChanged');
  this.connection?.on('LivestreamProductPinStatusChanged', (raw: Record<string, unknown>) => {
      const payload: ProductPinStatusChangedEvent = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
    productId: this.toStr(raw?.ProductId ?? raw?.productId),
    variantId: this.toStr(raw?.VariantId ?? raw?.variantId) ?? null,
    productName: this.toStr(raw?.ProductName ?? raw?.productName),
    originalPrice: this.toNum(raw?.OriginalPrice ?? raw?.originalPrice),
    price: this.toNum(raw?.Price ?? raw?.price),
    stock: this.toNum(raw?.Stock ?? raw?.stock),
    isPin: this.toBool(raw?.IsPin ?? raw?.isPin) ?? false,
    updatedBy: this.toStr(raw?.UpdatedBy ?? raw?.updatedBy),
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
      };
      cb(payload);
    });
  }

  onLivestreamProductStockUpdated(cb: (payload: ProductStockUpdatedEvent) => void) {
    this.connection?.off('LivestreamProductStockUpdated');
  this.connection?.on('LivestreamProductStockUpdated', (raw: Record<string, unknown>) => {
      const payload: ProductStockUpdatedEvent = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
    productId: this.toStr(raw?.ProductId ?? raw?.productId),
    variantId: this.toStr(raw?.VariantId ?? raw?.variantId) ?? null,
    productName: this.toStr(raw?.ProductName ?? raw?.productName),
    originalPrice: this.toNum(raw?.OriginalPrice ?? raw?.originalPrice),
    price: this.toNum(raw?.Price ?? raw?.price),
    newStock: this.toNum(raw?.NewStock ?? raw?.newStock),
    updatedBy: this.toStr(raw?.UpdatedBy ?? raw?.updatedBy),
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
      };
      cb(payload);
    });
  }

  onLivestreamProductDeleted(cb: (payload: ProductEventBase) => void) {
    this.connection?.off('LivestreamProductDeleted');
  this.connection?.on('LivestreamProductDeleted', (raw: Record<string, unknown>) => {
      const payload: ProductEventBase = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
    productId: this.toStr(raw?.ProductId ?? raw?.productId),
    variantId: this.toStr(raw?.VariantId ?? raw?.variantId) ?? null,
    updatedBy: this.toStr(raw?.DeletedBy ?? raw?.deletedBy),
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
      };
      cb(payload);
    });
  }

  onLivestreamProductSoftDeleted(cb: (payload: ProductEventBase & { reason?: string }) => void) {
    this.connection?.off('LivestreamProductSoftDeleted');
  this.connection?.on('LivestreamProductSoftDeleted', (raw: Record<string, unknown>) => {
      const payload: ProductEventBase & { reason?: string } = {
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
    productId: this.toStr(raw?.ProductId ?? raw?.productId),
    variantId: this.toStr(raw?.VariantId ?? raw?.variantId) ?? null,
    updatedBy: this.toStr(raw?.DeletedBy ?? raw?.deletedBy),
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
    message: this.toStr(raw?.Message ?? raw?.message),
    reason: this.toStr(raw?.Reason ?? raw?.reason),
      };
      cb(payload);
    });
  }

  onPinnedProductsUpdated(cb: (payload: PinnedProductsUpdatedEvent) => void) {
    this.connection?.off('PinnedProductsUpdated');
    this.connection?.on('PinnedProductsUpdated', (raw: Record<string, unknown>) => {
      const pinned = this.getArrayField(raw, 'PinnedProducts', 'pinnedProducts');
      const payload: PinnedProductsUpdatedEvent = {
        livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
        pinnedProducts: pinned,
        timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
        count: this.toNum(raw?.Count ?? raw?.count),
      };
      cb(payload);
    });
  }

  onLivestreamProductsLoaded(cb: (payload: LivestreamProductsLoadedPayload) => void) {
    this.connection?.off('LivestreamProductsLoaded');
    // also listen to lowercase variant to be safe
    try { this.connection?.off('livestreamproductsloaded' as unknown as string); } catch {}
    const handler = (raw: Record<string, unknown>) => {
      const list = this.getArrayField(raw, 'Products', 'products');
      const payload: LivestreamProductsLoadedPayload = {
        livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
        products: list,
        timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
        count: this.toNum(raw?.Count ?? raw?.count),
      };
      cb(payload);
    };
    this.connection?.on('LivestreamProductsLoaded', handler as unknown as (...args: never[]) => void);
    this.connection?.on('livestreamproductsloaded' as unknown as string, handler as unknown as (...args: never[]) => void);
  }

  onMaxCustomerViewerUpdated(cb: (payload: { livestreamId: string; newMaxCustomerViewer: number; previousMax: number; viewerType?: string; timestamp?: string; message?: string; }) => void) {
    this.connection?.off('MaxCustomerViewerUpdated');
    this.connection?.on('MaxCustomerViewerUpdated', (raw: Record<string, unknown>) => {
      const payload = {
        livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
        newMaxCustomerViewer: this.toNum(raw?.NewMaxCustomerViewer ?? raw?.newMaxCustomerViewer) ?? 0,
        previousMax: this.toNum(raw?.PreviousMax ?? raw?.previousMax) ?? 0,
        viewerType: this.toStr(raw?.ViewerType ?? raw?.viewerType),
        timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
        message: this.toStr(raw?.Message ?? raw?.message),
      };
      if (payload.livestreamId) {
        const currPeak = this.peakCustomerByLive.get(payload.livestreamId) ?? 0;
        this.peakCustomerByLive.set(payload.livestreamId, Math.max(currPeak, payload.newMaxCustomerViewer));
      }
      cb(payload);
    });
  }

  // Optional: listen for an explicit server signal if implemented
  onLivestreamEnded(cb: (payload: { livestreamId: string; summary?: unknown; timestamp?: string }) => void) {
    this.connection?.off('LivestreamEnded');
  this.connection?.on('LivestreamEnded', (raw: Record<string, unknown>) => {
      cb({
    livestreamId: this.toStr(raw?.LivestreamId ?? raw?.livestreamId) ?? '',
        summary: raw?.Summary ?? raw?.summary,
    timestamp: this.toStr(raw?.Timestamp ?? raw?.timestamp) ?? new Date().toISOString(),
      });
    });
  }

  // ---------- Unique viewer summary helpers ----------
  registerViewerForLivestream(livestreamId: string, userId: string) {
    if (!livestreamId || !userId) return;
    const set = this.uniqueViewersByLive.get(livestreamId) ?? new Set<string>();
    set.add(userId);
    this.uniqueViewersByLive.set(livestreamId, set);
  }

  getUniqueViewerCount(livestreamId: string): number {
    return this.uniqueViewersByLive.get(livestreamId)?.size ?? 0;
  }

  resetUniqueViewerTracking(livestreamId: string) {
    this.uniqueViewersByLive.delete(livestreamId);
  }

  getEndOfLiveSummary(livestreamId: string) {
    const uniqueViewers = this.getUniqueViewerCount(livestreamId);
    const lastStats = this.lastViewerStatsByLive.get(livestreamId);
    const peakCustomerViewers = this.peakCustomerByLive.get(livestreamId) ?? lastStats?.maxCustomerViewer ?? 0;
    return {
      livestreamId,
      uniqueViewers,
      peakCustomerViewers,
      lastTotalViewers: lastStats?.totalViewers ?? 0,
      lastViewersByRole: lastStats?.viewersByRole ?? {},
      endedAt: new Date().toISOString(),
    };
  }
}

export const chatHubService = new ChatHubService();
