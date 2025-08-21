import type { HubConnection } from "@microsoft/signalr";
import { chatHubService } from "./chatHub";
import type { ProductLiveStream } from "@/types/livestream/productLivestream";

export type ProductsLoadedPayload = {
  LivestreamId: string;
  Products: unknown[];
  Timestamp?: string;
  Count?: number;
};

export type ProductStockUpdatedPayload = {
  Id: string;
  LivestreamId: string;
  ProductId?: string;
  VariantId?: string | null;
  NewStock?: number;
  OriginalPrice?: number;
  Price?: number;
  ProductName?: string;
  UpdatedBy?: string;
  Timestamp?: string;
  Message?: string;
};

export type ProductDeletedPayload = {
  Id: string;
  DeletedBy?: string;
  Timestamp?: string;
  Message?: string;
};

function mapProduct(raw: Record<string, unknown>): ProductLiveStream {
  return {
    id: String(raw["id"] ?? raw["Id"] ?? ""),
    livestreamId: String(raw["livestreamId"] ?? raw["LivestreamId"] ?? ""),
    productId: String(raw["productId"] ?? raw["ProductId"] ?? ""),
    variantId: String(raw["variantId"] ?? raw["VariantId"] ?? ""),
    isPin: Boolean(raw["isPin"] ?? raw["IsPin"] ?? false),
    originalPrice: Number(raw["originalPrice"] ?? raw["OriginalPrice"] ?? 0),
    price: Number(raw["price"] ?? raw["Price"] ?? 0),
    stock: Number(raw["stock"] ?? raw["Stock"] ?? 0),
    createAt: (raw["createAt"] ?? raw["CreateAt"]) as Date,
    lastModifiedAt: (raw["lastModifiedAt"] ?? raw["LastModifiedAt"]) as Date,
    productName: String(raw["productName"] ?? raw["ProductName"] ?? ""),
    productImageUrl: String(raw["productImageUrl"] ?? raw["ProductImageUrl"] ?? ""),
    variantName: String(raw["variantName"] ?? raw["VariantName"] ?? ""),
    variantImageUrl: String(raw["variantImageUrl"] ?? raw["VariantImageUrl"] ?? ""),
    sku: String(raw["sku"] ?? raw["SKU"] ?? raw["Sku"] ?? ""),
    productStock: Number(raw["productStock"] ?? raw["ProductStock"] ?? 0),
  } as ProductLiveStream;
}

class LivestreamProductsClient {
  private handlersBound = false;
  private onLoadedCbs = new Set<(livestreamId: string, products: ProductLiveStream[]) => void>();
  private onErrorCbs = new Set<(message: string) => void>();
  private onStockUpdatedCbs = new Set<(payload: ProductStockUpdatedPayload) => void>();
  private onDeletedCbs = new Set<(payload: ProductDeletedPayload) => void>();

  private async bindHandlers() {
    if (this.handlersBound) return;
    const conn = (await chatHubService.getConnection()) as HubConnection;
  try { conn.off("LivestreamProductsLoaded"); } catch {}
  try { conn.off("LivestreamProductStockUpdated"); } catch {}
  try { conn.off("LivestreamProductDeleted"); } catch {}
  try { conn.off("Error"); } catch {}

    conn.on("LivestreamProductsLoaded", (payload: ProductsLoadedPayload) => {
      const list = Array.isArray(payload?.Products) ? payload.Products : [];
      const products = list.map((x) => mapProduct((x as Record<string, unknown>) ?? {}));
      const livestreamId = String(payload?.LivestreamId ?? "");
      this.onLoadedCbs.forEach((cb) => cb(livestreamId, products));
    });

    conn.on("LivestreamProductStockUpdated", (payload: ProductStockUpdatedPayload) => {
      try {
        const p = payload ?? ({} as ProductStockUpdatedPayload);
        this.onStockUpdatedCbs.forEach((cb) => cb(p));
      } catch {}
    });

    conn.on("LivestreamProductDeleted", (payload: ProductDeletedPayload) => {
      try {
        const p = payload ?? ({} as ProductDeletedPayload);
        this.onDeletedCbs.forEach((cb) => cb(p));
      } catch {}
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

  onLoaded(cb: (livestreamId: string, products: ProductLiveStream[]) => void) {
    this.onLoadedCbs.add(cb);
    return () => this.onLoadedCbs.delete(cb);
  }

  onError(cb: (message: string) => void) {
    this.onErrorCbs.add(cb);
    return () => this.onErrorCbs.delete(cb);
  }

  onStockUpdated(cb: (payload: ProductStockUpdatedPayload) => void) {
    this.onStockUpdatedCbs.add(cb);
    return () => this.onStockUpdatedCbs.delete(cb);
  }

  onDeleted(cb: (payload: ProductDeletedPayload) => void) {
    this.onDeletedCbs.add(cb);
    return () => this.onDeletedCbs.delete(cb);
  }

  async loadProducts(livestreamId: string) {
    await this.ensureReady(livestreamId);
    const conn = (await chatHubService.getConnection()) as HubConnection;
    // Server also emits LivestreamProductsLoaded to the caller, but we map the return as a reliable fallback
    const result = (await conn.invoke(
      "GetLivestreamProducts",
      livestreamId
    )) as unknown;
    try {
      const arr = Array.isArray(result) ? result : [];
      const mapped = arr.map((x) => mapProduct((x as Record<string, unknown>) ?? {}));
      // Optional: also notify listeners immediately (acts as fast path)
      const lid = String(livestreamId);
      this.onLoadedCbs.forEach((cb) => cb(lid, mapped));
      return mapped;
  } catch {
      // in case of shape mismatch, just return empty and rely on event
      return [] as ProductLiveStream[];
    }
  }
}

export const livestreamProductsClient = new LivestreamProductsClient();
export default LivestreamProductsClient;
