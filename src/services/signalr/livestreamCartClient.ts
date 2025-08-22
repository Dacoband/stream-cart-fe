import type { HubConnection } from "@microsoft/signalr";
import { chatHubService } from "./chatHub";

export interface LivestreamCartItem {
  id: string;
  livestreamProductId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  shopId: string;
  shopName: string;
  livestreamPrice: number;
  originalPrice: number;
  discountPercentage?: number;
  quantity: number;
  stock: number;
  primaryImage?: string;
  attributes?: unknown;
  productStatus?: string | boolean;
  totalPrice: number;
  createdAt?: string;
}

export interface LivestreamCartData {
  livestreamCartId?: string;
  livestreamId: string;
  viewerId?: string;
  items: LivestreamCartItem[];
  totalItems: number;
  totalAmount: number;
  totalDiscount?: number;
  subTotal?: number;
  isActive?: boolean;
  expiresAt?: string | null;
  createdAt?: string;
}

function mapItem(server: Record<string, unknown>): LivestreamCartItem {
  return {
    id: String(server["Id"] ?? server["id"] ?? ""),
    livestreamProductId: String(server["LivestreamProductId"] ?? server["livestreamProductId"] ?? ""),
    productId: String(server["ProductId"] ?? server["productId"] ?? ""),
    variantId: (server["VariantId"] as string | null | undefined) ?? (server["variantId"] as string | null | undefined) ?? null,
    productName: (server["ProductName"] as string) ?? (server["productName"] as string) ?? "",
    shopId: String(server["ShopId"] ?? server["shopId"] ?? ""),
    shopName: (server["ShopName"] as string) ?? (server["shopName"] as string) ?? "",
    livestreamPrice: Number((server["LivestreamPrice"] as number) ?? (server["livestreamPrice"] as number) ?? 0),
    originalPrice: Number((server["OriginalPrice"] as number) ?? (server["originalPrice"] as number) ?? 0),
    discountPercentage:
      server["DiscountPercentage"] != null || server["discountPercentage"] != null
        ? Number((server["DiscountPercentage"] as number) ?? (server["discountPercentage"] as number))
        : undefined,
    quantity: Number((server["Quantity"] as number) ?? (server["quantity"] as number) ?? 0),
    stock: Number((server["Stock"] as number) ?? (server["stock"] as number) ?? 0),
    primaryImage: (server["PrimaryImage"] as string) ?? (server["primaryImage"] as string) ?? undefined,
    attributes: server["Attributes"] ?? server["attributes"],
    productStatus: (server["ProductStatus"] as string | boolean) ?? (server["productStatus"] as string | boolean) ?? undefined,
    totalPrice: Number((server["TotalPrice"] as number) ?? (server["totalPrice"] as number) ?? 0),
    createdAt: (server["CreatedAt"] as string) ?? (server["createdAt"] as string) ?? undefined,
  };
}

function mapCart(server: unknown): LivestreamCartData {
  const obj = (server as Record<string, unknown>) ?? {};
  const rawItems = (obj["Items"] as unknown[]) ?? (obj["items"] as unknown[]) ?? [];
  const items = Array.isArray(rawItems)
    ? rawItems.map((x) => mapItem((x as Record<string, unknown>) ?? {}))
    : [];
  return {
    livestreamCartId: obj["LivestreamCartId"]
      ? String(obj["LivestreamCartId"]) 
      : obj["livestreamCartId"] 
        ? String(obj["livestreamCartId"]) 
        : undefined,
    livestreamId: String((obj["LivestreamId"] as string) ?? (obj["livestreamId"] as string) ?? ""),
    viewerId: obj["ViewerId"] ? String(obj["ViewerId"]) : (obj["viewerId"] ? String(obj["viewerId"]) : undefined),
    items,
    totalItems: Number((obj["TotalItems"] as number) ?? (obj["totalItems"] as number) ?? 0),
    totalAmount: Number((obj["TotalAmount"] as number) ?? (obj["totalAmount"] as number) ?? 0),
    totalDiscount:
      obj["TotalDiscount"] != null || obj["totalDiscount"] != null
        ? Number((obj["TotalDiscount"] as number) ?? (obj["totalDiscount"] as number))
        : undefined,
    subTotal:
      obj["SubTotal"] != null || obj["subTotal"] != null
        ? Number((obj["SubTotal"] as number) ?? (obj["subTotal"] as number))
        : undefined,
    isActive: (obj["IsActive"] as boolean) ?? (obj["isActive"] as boolean) ?? undefined,
    expiresAt: (obj["ExpiresAt"] as string) ?? (obj["expiresAt"] as string) ?? null,
    createdAt: (obj["CreatedAt"] as string) ?? (obj["createdAt"] as string) ?? undefined,
  };
}

export type CartUpdatedAction = "ITEM_ADDED" | "ITEM_UPDATED" | "ITEM_REMOVED";

export type CartUpdatedPayload = {
  Action?: CartUpdatedAction; action?: CartUpdatedAction;
  LivestreamId?: string; livestreamId?: string;
  Cart?: unknown; cart?: unknown;
  ProductName?: string; productName?: string;
  Quantity?: number; quantity?: number;
  NewQuantity?: number; newQuantity?: number;
  Timestamp?: string; timestamp?: string;
  Message?: string; message?: string;
};

type CartLoadedPayload = { LivestreamId?: string; Cart?: unknown; Timestamp?: string; livestreamId?: string; cart?: unknown; timestamp?: string };
export type CartClearedPayload = { LivestreamId: string; Message?: string; Timestamp?: string };

class LivestreamCartClient {
  private handlersBound = false;
  private onLoadedCbs = new Set<(cart: LivestreamCartData) => void>();
  private onUpdatedCbs = new Set<(
    action: CartUpdatedAction,
    cart: LivestreamCartData,
    raw: CartUpdatedPayload
  ) => void>();
  private onClearedCbs = new Set<(payload: CartClearedPayload) => void>();
  private onErrorCbs = new Set<(message: string) => void>();

  private async bindHandlers() {
    if (this.handlersBound) return;
    const conn = (await chatHubService.getConnection()) as HubConnection;
    try { conn.off("LivestreamCartLoaded"); } catch {}
    try { conn.off("LivestreamCartUpdated"); } catch {}
    try { conn.off("LivestreamCartCleared"); } catch {}
    try { conn.off("Error"); } catch {}

    conn.on("LivestreamCartLoaded", (payload: CartLoadedPayload) => {
      const cart = mapCart(payload?.Cart ?? payload?.cart ?? {});
      this.onLoadedCbs.forEach((cb) => cb(cart));
    });

    conn.on("LivestreamCartUpdated", (payload: CartUpdatedPayload) => {
      const cart = mapCart(payload?.Cart ?? payload?.cart ?? {});
      const action = (payload?.Action ?? payload?.action ?? "ITEM_UPDATED") as CartUpdatedAction;
      this.onUpdatedCbs.forEach((cb) => cb(action, cart, payload));
    });

    conn.on("LivestreamCartCleared", (payload: CartClearedPayload) => {
      this.onClearedCbs.forEach((cb) => cb(payload));
    });

    conn.on("Error", (msg: unknown) => {
      const text = typeof msg === "string" ? msg : JSON.stringify(msg);
      this.onErrorCbs.forEach((cb) => cb(text));
    });

    this.handlersBound = true;
  }

  async ensureReady(livestreamId?: string) {
    await chatHubService.ensureStarted();
    if (livestreamId) {
      try { await chatHubService.joinLivestream(livestreamId); } catch {}
    }
    await this.bindHandlers();
  }

  onLoaded(cb: (cart: LivestreamCartData) => void) {
    this.onLoadedCbs.add(cb);
    return () => this.onLoadedCbs.delete(cb);
  }
  onUpdated(cb: (action: CartUpdatedAction, cart: LivestreamCartData, raw: CartUpdatedPayload) => void) {
    this.onUpdatedCbs.add(cb);
    return () => this.onUpdatedCbs.delete(cb);
  }
  onCleared(cb: (payload: CartClearedPayload) => void) {
    this.onClearedCbs.add(cb);
    return () => this.onClearedCbs.delete(cb);
  }
  onError(cb: (message: string) => void) {
    this.onErrorCbs.add(cb);
    return () => this.onErrorCbs.delete(cb);
  }

  async loadCart(livestreamId: string) {
    await this.ensureReady(livestreamId);
    const conn = (await chatHubService.getConnection()) as HubConnection;
    return conn.invoke("GetLivestreamCart", livestreamId);
  }

  async addToCart(livestreamId: string, livestreamProductId: string, quantity = 1) {
    await this.ensureReady(livestreamId);
    const conn = (await chatHubService.getConnection()) as HubConnection;
    return conn.invoke("AddToLivestreamCart", livestreamId, livestreamProductId, quantity);
  }

  async updateItemQuantity(cartItemId: string, newQuantity: number) {
    await this.ensureReady();
    const conn = (await chatHubService.getConnection()) as HubConnection;
    return conn.invoke("UpdateLivestreamCartItemQuantity", cartItemId, newQuantity);
  }
}

export const livestreamCartClient = new LivestreamCartClient();
export default LivestreamCartClient;
