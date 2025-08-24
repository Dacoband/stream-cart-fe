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
  // Also support lowercase variants that come from server
  id?: string;
  livestreamId?: string;
  productId?: string;
  variantId?: string | null;
  newStock?: number;
  originalPrice?: number;
  price?: number;
  productName?: string;
  updatedBy?: string;
  timestamp?: string;
  message?: string;
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
    
    // Helper to map list payloads into typed products and fan-out to onLoaded
    const handleList = (payload: ProductsLoadedPayload | Record<string, unknown>) => {
      const raw = payload as unknown as Record<string, unknown>;
      const list = Array.isArray((payload as ProductsLoadedPayload)?.Products)
        ? (payload as ProductsLoadedPayload).Products
        : (Array.isArray(raw?.["Products"]) ? (raw["Products"] as unknown[]) : []);
      const products = list.map((x) => mapProduct((x as Record<string, unknown>) ?? {}));
      const livestreamId = String((payload as ProductsLoadedPayload)?.LivestreamId ?? raw?.["LivestreamId"] ?? "");
      this.onLoadedCbs.forEach((cb) => cb(livestreamId, products));
    };

    // Id-based stock updates
    const handleIdStock = (payload: ProductStockUpdatedPayload | Record<string, unknown>) => {
      try {
        const p = payload as ProductStockUpdatedPayload ?? ({} as ProductStockUpdatedPayload);
        this.onStockUpdatedCbs.forEach((cb) => cb(p));
      } catch {}
    };

    // Add generic event listener to catch all events including new backend events
    const eventNames = [
      'LivestreamProductStockUpdated', 'livestreamproductstockupdated',
      'ProductStockUpdated', 'productstockupdated',
      'StockChanged', 'stockchanged',
      'StockUpdated', 'stockupdated',
      'UpdateSuccess', 'updatesuccess',
      'LivestreamProductUpdated', 'livestreamproductupdated',
      'TestBroadcast', 'testbroadcast',
      'ViewingStarted', 'viewingstarted', // New confirmation event
      'Error', 'error'
    ];
    
    eventNames.forEach(eventName => {
      conn.on(eventName as string, (...args: unknown[]) => {
        // Handle ViewingStarted confirmation
        if (eventName.toLowerCase() === 'viewingstarted') {
          // Connection confirmed - viewer joined group successfully
        }
        
        // If this is a stock update event, also trigger the stock handler
        if (eventName.toLowerCase().includes('stock')) {
          const payload = args[0] as Record<string, unknown>;
          if (payload) {
            handleIdStock(payload);
          }
        }
      });
    });
  // Clean up possible previous handlers (both casings)
  try { conn.off("LivestreamProductsLoaded"); } catch {}
  try { conn.off("livestreamproductsloaded" as unknown as string); } catch {}
  try { conn.off("LivestreamProductsRefreshed"); } catch {}
  try { conn.off("livestreamproductsrefreshed" as unknown as string); } catch {}
  try { conn.off("LivestreamProductStockUpdated"); } catch {}
  try { conn.off("livestreamproductstockupdated" as unknown as string); } catch {}
  try { conn.off("LivestreamProductUpdated"); } catch {}
  try { conn.off("livestreamproductupdated" as unknown as string); } catch {}
  try { conn.off("ProductStockUpdated"); } catch {}
  try { conn.off("productstockupdated" as unknown as string); } catch {}
  try { conn.off("StockChanged"); } catch {}
  try { conn.off("stockchanged" as unknown as string); } catch {}
  try { conn.off("LivestreamProductDeleted"); } catch {}
  try { conn.off("livestreamproductdeleted" as unknown as string); } catch {}
  try { conn.off("Error"); } catch {}
  try { conn.off("error" as unknown as string); } catch {}

    // Loaded/Refreshed events (treat the same)
    conn.on("LivestreamProductsLoaded", (payload: ProductsLoadedPayload) => {
      console.log("[DEBUG] ✅ LivestreamProductsLoaded event received:", payload);
      handleList(payload);
    });
    conn.on("livestreamproductsloaded" as unknown as string, (payload: ProductsLoadedPayload) => {
      console.log("[DEBUG] ✅ livestreamproductsloaded event received:", payload);
      handleList(payload);
    });
    conn.on("LivestreamProductsRefreshed", (payload: ProductsLoadedPayload) => {
      handleList(payload);
    });
    conn.on("livestreamproductsrefreshed" as unknown as string, (payload: ProductsLoadedPayload) => {
      handleList(payload);
    });

    conn.on("LivestreamProductStockUpdated", (payload: ProductStockUpdatedPayload) => {
      handleIdStock(payload);
    });
    conn.on("livestreamproductstockupdated" as unknown as string, (payload: ProductStockUpdatedPayload) => {
      handleIdStock(payload);
    });

    // Generic update by Id that may include new stock
    conn.on("LivestreamProductUpdated", (raw: Record<string, unknown>) => {
      try {
        const payload: ProductStockUpdatedPayload = {
          Id: String(raw?.["Id"] ?? raw?.["id"] ?? ""),
          LivestreamId: String(raw?.["LivestreamId"] ?? raw?.["livestreamId"] ?? ""),
          ProductId: String(raw?.["ProductId"] ?? raw?.["productId"] ?? ""),
          VariantId: (raw?.["VariantId"] ?? raw?.["variantId"]) as string | null | undefined,
          NewStock: Number(raw?.["Stock"] ?? raw?.["stock"] ?? NaN),
          OriginalPrice: Number(raw?.["OriginalPrice"] ?? raw?.["originalPrice"] ?? NaN),
          Price: Number(raw?.["Price"] ?? raw?.["price"] ?? NaN),
          ProductName: String(raw?.["ProductName"] ?? raw?.["productName"] ?? ""),
          UpdatedBy: String(raw?.["UpdatedBy"] ?? raw?.["updatedBy"] ?? ""),
          Timestamp: String(raw?.["Timestamp"] ?? raw?.["timestamp"] ?? new Date().toISOString()),
          Message: String(raw?.["Message"] ?? raw?.["message"] ?? ""),
        };
        this.onStockUpdatedCbs.forEach((cb) => cb(payload));
      } catch {}
    });
    conn.on("livestreamproductupdated" as unknown as string, (raw: Record<string, unknown>) => {
      try {
        const payload: ProductStockUpdatedPayload = {
          Id: String(raw?.["Id"] ?? raw?.["id"] ?? ""),
          LivestreamId: String(raw?.["LivestreamId"] ?? raw?.["livestreamId"] ?? ""),
          ProductId: String(raw?.["ProductId"] ?? raw?.["productId"] ?? ""),
          VariantId: (raw?.["VariantId"] ?? raw?.["variantId"]) as string | null | undefined,
          NewStock: Number(raw?.["Stock"] ?? raw?.["stock"] ?? NaN),
          OriginalPrice: Number(raw?.["OriginalPrice"] ?? raw?.["originalPrice"] ?? NaN),
          Price: Number(raw?.["Price"] ?? raw?.["price"] ?? NaN),
          ProductName: String(raw?.["ProductName"] ?? raw?.["productName"] ?? ""),
          UpdatedBy: String(raw?.["UpdatedBy"] ?? raw?.["updatedBy"] ?? ""),
          Timestamp: String(raw?.["Timestamp"] ?? raw?.["timestamp"] ?? new Date().toISOString()),
          Message: String(raw?.["Message"] ?? raw?.["message"] ?? ""),
        };
        this.onStockUpdatedCbs.forEach((cb) => cb(payload));
      } catch {}
    });

    conn.on("LivestreamProductDeleted", (payload: ProductDeletedPayload) => {
      try {
        const p = payload ?? ({} as ProductDeletedPayload);
        this.onDeletedCbs.forEach((cb) => cb(p));
      } catch {}
    });
    conn.on("livestreamproductdeleted" as unknown as string, (payload: ProductDeletedPayload) => {
      try {
        const p = payload ?? ({} as ProductDeletedPayload);
        this.onDeletedCbs.forEach((cb) => cb(p));
      } catch {}
    });

    // Product-level stock updates that don't include Id
    const handleProdStock = (raw: Record<string, unknown>) => {
      try {
        const payload: ProductStockUpdatedPayload = {
          Id: "",
          LivestreamId: String(raw?.["LivestreamId"] ?? raw?.["livestreamId"] ?? ""),
          ProductId: String(raw?.["ProductId"] ?? raw?.["productId"] ?? ""),
          VariantId: (raw?.["VariantId"] ?? raw?.["variantId"]) as string | null | undefined,
          NewStock: Number(raw?.["NewStock"] ?? raw?.["newStock"] ?? NaN),
          OriginalPrice: Number(raw?.["OriginalPrice"] ?? raw?.["originalPrice"] ?? NaN),
          Price: Number(raw?.["Price"] ?? raw?.["price"] ?? NaN),
          ProductName: String(raw?.["ProductName"] ?? raw?.["productName"] ?? ""),
          UpdatedBy: String(raw?.["UpdatedBy"] ?? raw?.["updatedBy"] ?? ""),
          Timestamp: String(raw?.["Timestamp"] ?? raw?.["timestamp"] ?? new Date().toISOString()),
          Message: String(raw?.["Message"] ?? raw?.["message"] ?? ""),
        };
        this.onStockUpdatedCbs.forEach((cb) => cb(payload));
      } catch {}
    };
    conn.on("ProductStockUpdated", (raw: Record<string, unknown>) => handleProdStock(raw));
    conn.on("productstockupdated" as unknown as string, (raw: Record<string, unknown>) => handleProdStock(raw));
    conn.on("StockChanged", (raw: Record<string, unknown>) => handleProdStock(raw));
    conn.on("stockchanged" as unknown as string, (raw: Record<string, unknown>) => handleProdStock(raw));

    conn.on("Error", (msg: unknown) => {
      const text = typeof msg === "string" ? msg : JSON.stringify(msg);
      this.onErrorCbs.forEach((cb) => cb(text));
    });
    conn.on("error" as unknown as string, (msg: unknown) => {
      const text = typeof msg === "string" ? msg : JSON.stringify(msg);
      this.onErrorCbs.forEach((cb) => cb(text));
    });

    this.handlersBound = true;
  }

  async ensureReady(livestreamId?: string) {
    await chatHubService.ensureStarted();
    if (livestreamId) {
      // Important: join the viewers group to receive product broadcasts
      try { 
        await chatHubService.startViewingLivestream(livestreamId); 
      } catch {
        // Even if startViewingLivestream fails (auth issue), still try to join chat
      }
      // Also join the chat room for chat-related events
      try { 
        await chatHubService.joinLivestream(livestreamId); 
      } catch {
        // Ignore join chat errors
      }
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
