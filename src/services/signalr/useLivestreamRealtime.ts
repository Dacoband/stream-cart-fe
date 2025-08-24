import { useEffect, useMemo, useRef, useState } from 'react';
import { chatHubService, ViewerStatsPayload, ProductAddedEvent, ProductEventBase, ProductPinStatusChangedEvent, ProductStockUpdatedEvent, PinnedProductsUpdatedEvent, LivestreamProductsLoadedPayload } from './chatHub';

export interface LivestreamRealtimeState {
  viewerStats: ViewerStatsPayload | null;
  pinnedProducts: unknown[];
  products: unknown[];
  lastAdded?: ProductAddedEvent;
  lastRemoved?: ProductEventBase;
  lastUpdated?: ProductEventBase;
  lastPinChange?: ProductPinStatusChangedEvent;
  lastStockChange?: ProductStockUpdatedEvent;
  uniqueViewerCount: number;
}

export interface LivestreamRealtimeApi extends LivestreamRealtimeState {
  // actions (basic)
  pinProduct: (productId: string, variantId: string | null, isPin: boolean) => Promise<unknown>;
  updateProductStock: (productId: string, variantId: string | null, newStock: number) => Promise<unknown>;
  addProduct: (productId: string, variantId: string | null, price: number, stock: number, isPin?: boolean) => Promise<unknown>;
  removeProduct: (productId: string, variantId: string | null) => Promise<unknown>;
  // actions (by id)
  updateById: (id: string, price: number, stock: number, isPin: boolean) => Promise<unknown>;
  pinById: (id: string, isPin: boolean) => Promise<unknown>;
  updateStockById: (id: string, newStock: number) => Promise<unknown>;
  deleteById: (id: string) => Promise<unknown>;
  softDeleteById: (id: string, reason?: string) => Promise<unknown>;
  // queries
  refreshPinned: () => Promise<unknown>;
  refreshProducts: () => Promise<unknown>;
  // summary
  getSummary: () => {
    livestreamId: string;
    uniqueViewers: number;
    peakCustomerViewers: number;
    lastTotalViewers: number;
    lastViewersByRole: Record<string, number>;
    endedAt: string;
  };
}

export function useLivestreamRealtime(livestreamId?: string): LivestreamRealtimeApi {
  const [viewerStats, setViewerStats] = useState<ViewerStatsPayload | null>(null);
  const [pinnedProducts, setPinnedProducts] = useState<unknown[]>([]);
  const [products, setProducts] = useState<unknown[]>([]);
  const [lastAdded, setLastAdded] = useState<ProductAddedEvent | undefined>(undefined);
  const [lastRemoved, setLastRemoved] = useState<ProductEventBase | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<ProductEventBase | undefined>(undefined);
  const [lastPinChange, setLastPinChange] = useState<ProductPinStatusChangedEvent | undefined>(undefined);
  const [lastStockChange, setLastStockChange] = useState<ProductStockUpdatedEvent | undefined>(undefined);
  const [uniqueViewerCount, setUniqueViewerCount] = useState<number>(0);

  const liveRef = useRef<string | undefined>(livestreamId);
  liveRef.current = livestreamId;
  // prevent rapid duplicate pin invocations (double-clicks, retries)
  const inFlightPinsRef = useRef<Set<string>>(new Set());
  const lastPinAtRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!livestreamId) return;

    let mounted = true;
    (async () => {
      try {
        await chatHubService.ensureStarted();
        await chatHubService.startViewingLivestream(livestreamId);
        await chatHubService.joinLivestream(livestreamId);

        // viewer stats
        chatHubService.onViewerStats((stats) => {
          if (!mounted) return;
          setViewerStats(stats);
        });

        // user joined -> track unique viewer
        chatHubService.onUserJoined((p) => {
          if (!mounted) return;
          chatHubService.registerViewerForLivestream(livestreamId, p.userId);
          setUniqueViewerCount(chatHubService.getUniqueViewerCount(livestreamId));
        });

        // product events
        chatHubService.onPinnedProductsUpdated((ev: PinnedProductsUpdatedEvent) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setPinnedProducts(ev.pinnedProducts || []);
        });
        // full product list loaded for caller
        chatHubService.onLivestreamProductsLoaded?.((payload: LivestreamProductsLoadedPayload) => {
          if (!mounted) return;
          const lid = payload.livestreamId;
          if (!lid || String(lid) !== String(livestreamId)) return;
          const list = payload.products ?? [];
          setProducts(Array.isArray(list) ? list : []);
        });
        chatHubService.onProductAdded((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastAdded(ev);
          const added = ev.product as Record<string, unknown> | undefined;
          if (added) {
            setProducts((prev) => {
              const get = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined) return o[k]; return undefined; };
              const toStr = (v: unknown) => (v == null ? undefined : String(v));
              const id = toStr(get(added, ['id','Id','ID']));
              const productId = toStr(get(added, ['productId','ProductId']));
              const variantId = toStr(get(added, ['variantId','VariantId'])) ?? '';
              const exists = prev.some((p) => {
                const r = p as Record<string, unknown>;
                const rid = toStr(get(r, ['id','Id','ID']));
                const rpid = toStr(get(r, ['productId','ProductId']));
                const rvid = toStr(get(r, ['variantId','VariantId'])) ?? '';
                return (id && rid === id) || (!!productId && rpid === productId && rvid === variantId);
              });
              return exists ? prev : [added, ...prev];
            });
          }
        });
        chatHubService.onProductRemoved((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastRemoved(ev);
          setProducts((prev) => prev.filter((p) => {
            const r = p as Record<string, unknown>;
            const toStr = (v: unknown) => (v == null ? undefined : String(v));
            const get = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined) return o[k]; return undefined; };
            const rpid = toStr(get(r, ['productId','ProductId']));
            const rvid = toStr(get(r, ['variantId','VariantId'])) ?? '';
            return !(rpid === ev.productId && rvid === (ev.variantId ?? ''));
          }));
        });
        chatHubService.onLivestreamProductDeleted((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setProducts((prev) => prev.filter((p) => {
            const r = p as Record<string, unknown>;
            const toStr = (v: unknown) => (v == null ? undefined : String(v));
            const get = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined) return o[k]; return undefined; };
            const rpid = toStr(get(r, ['productId','ProductId']));
            const rvid = toStr(get(r, ['variantId','VariantId'])) ?? '';
            return !(rpid === ev.productId && rvid === (ev.variantId ?? ''));
          }));
        });
        chatHubService.onLivestreamProductSoftDeleted((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setProducts((prev) => prev.filter((p) => {
            const r = p as Record<string, unknown>;
            const toStr = (v: unknown) => (v == null ? undefined : String(v));
            const get = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined) return o[k]; return undefined; };
            const rpid = toStr(get(r, ['productId','ProductId']));
            const rvid = toStr(get(r, ['variantId','VariantId'])) ?? '';
            return !(rpid === ev.productId && rvid === (ev.variantId ?? ''));
          }));
        });
        chatHubService.onLivestreamProductUpdated((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastUpdated(ev);
          setProducts((prev) => prev.map((p) => {
            const r = p as Record<string, unknown>;
            const toStr = (v: unknown) => (v == null ? undefined : String(v));
            const get = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined) return o[k]; return undefined; };
            const rpid = toStr(get(r, ['productId','ProductId']));
            const rvid = toStr(get(r, ['variantId','VariantId'])) ?? '';
            const match = rpid === ev.productId && rvid === (ev.variantId ?? '');
            if (!match) return p;
            const updated: Record<string, unknown> = { ...r };
            if (ev.price !== undefined) updated.price = ev.price;
            if (ev.stock !== undefined) updated.stock = ev.stock;
            if (ev.productName !== undefined) updated.productName = ev.productName;
            return updated as unknown as typeof p;
          }));
        });
        chatHubService.onProductPinStatusChanged((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastPinChange(ev);
        });
        chatHubService.onLivestreamProductPinStatusChanged((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastPinChange(ev);
        });
        chatHubService.onProductStockUpdated((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastStockChange(ev);
          setProducts((prev) => prev.map((p) => {
            const r = p as Record<string, unknown>;
            const toStr = (v: unknown) => (v == null ? undefined : String(v));
            const get = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined) return o[k]; return undefined; };
            const rpid = toStr(get(r, ['productId','ProductId']));
            const rvid = toStr(get(r, ['variantId','VariantId'])) ?? '';
            const match = rpid === ev.productId && rvid === (ev.variantId ?? '');
            if (!match) return p;
            const updated: Record<string, unknown> = { ...r };
            if (ev.newStock !== undefined) updated.stock = ev.newStock;
            return updated as unknown as typeof p;
          }));
        });
        chatHubService.onLivestreamProductStockUpdated((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastStockChange(ev);
          setProducts((prev) => prev.map((p) => {
            const r = p as Record<string, unknown>;
            const toStr = (v: unknown) => (v == null ? undefined : String(v));
            const get = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined) return o[k]; return undefined; };
            const rpid = toStr(get(r, ['productId','ProductId']));
            const rvid = toStr(get(r, ['variantId','VariantId'])) ?? '';
            const match = rpid === ev.productId && rvid === (ev.variantId ?? '');
            if (!match) return p;
            const updated: Record<string, unknown> = { ...r };
            if (ev.newStock !== undefined) updated.stock = ev.newStock;
            return updated as unknown as typeof p;
          }));
        });

        // Keep local isPin in sync for quick UI feedback (server also sends pin updates)
        chatHubService.onProductPinStatusChanged((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setProducts((prev) => prev.map((p) => {
            const r = p as Record<string, unknown>;
            const toStr = (v: unknown) => (v == null ? undefined : String(v));
            const get = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined) return o[k]; return undefined; };
            const rpid = toStr(get(r, ['productId','ProductId']));
            const rvid = toStr(get(r, ['variantId','VariantId'])) ?? '';
            const match = rpid === ev.productId && rvid === (ev.variantId ?? '');
            if (!match) return p;
            const updated: Record<string, unknown> = { ...r };
            updated.isPin = ev.isPin;
            return updated as unknown as typeof p;
          }));
        });
        chatHubService.onLivestreamProductPinStatusChanged((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setProducts((prev) => prev.map((p) => {
            const r = p as Record<string, unknown>;
            const toStr = (v: unknown) => (v == null ? undefined : String(v));
            const get = (o: Record<string, unknown>, keys: string[]) => { for (const k of keys) if (o[k] !== undefined) return o[k]; return undefined; };
            const rpid = toStr(get(r, ['productId','ProductId']));
            const rvid = toStr(get(r, ['variantId','VariantId'])) ?? '';
            const match = rpid === ev.productId && rvid === (ev.variantId ?? '');
            if (!match) return p;
            const updated: Record<string, unknown> = { ...r };
            updated.isPin = ev.isPin;
            return updated as unknown as typeof p;
          }));
        });

  // initial fetch: avoid GetPinnedProducts because server broadcasts to entire group
        try { await chatHubService.getLivestreamProducts(livestreamId); } catch {}
  } catch {
        // swallow; components can show fallback
        // console.error('useLivestreamRealtime init failed', e);
      }
    })();

    return () => {
      mounted = false;
      // soft clean-up (ignore errors)
      chatHubService.stopViewingLivestream(livestreamId).catch(() => {});
      chatHubService.leaveLivestream(livestreamId).catch(() => {});
    };
  }, [livestreamId]);

  // action wrappers (memoized)
  const api = useMemo<LivestreamRealtimeApi>(() => ({
    viewerStats,
    pinnedProducts,
  products,
    lastAdded,
    lastRemoved,
    lastUpdated,
    lastPinChange,
    lastStockChange,
    uniqueViewerCount,

    pinProduct: (productId, variantId, isPin) => {
      if (!liveRef.current) return Promise.resolve();
      const key = `${liveRef.current}|${productId}|${variantId ?? ''}`;
      // throttle duplicates within 700ms and while in-flight
      if (inFlightPinsRef.current.has(key)) return Promise.resolve();
      const lastAt = lastPinAtRef.current.get(key) ?? 0;
      if (Date.now() - lastAt < 700) return Promise.resolve();
      inFlightPinsRef.current.add(key);
      return chatHubService
        .pinProduct(liveRef.current, productId, variantId, isPin)
        .finally(() => {
          inFlightPinsRef.current.delete(key);
          lastPinAtRef.current.set(key, Date.now());
        });
    },
    updateProductStock: (productId, variantId, newStock) => {
      if (!liveRef.current) return Promise.resolve();
      return chatHubService.updateProductStock(liveRef.current, productId, variantId, newStock);
    },
    addProduct: (productId, variantId, price, stock, isPin = false) => {
      if (!liveRef.current) return Promise.resolve();
      return chatHubService.addProductToLivestream(liveRef.current, productId, variantId, price, stock, isPin);
    },
    removeProduct: (productId, variantId) => {
      if (!liveRef.current) return Promise.resolve();
      return chatHubService.removeProductFromLivestream(liveRef.current, productId, variantId);
    },

    updateById: (id, price, stock, isPin) => chatHubService.updateLivestreamProductById(id, price, stock, isPin),
    pinById: (id, isPin) => {
      const key = `byId|${id}`;
      if (inFlightPinsRef.current.has(key)) return Promise.resolve();
      const lastAt = lastPinAtRef.current.get(key) ?? 0;
      if (Date.now() - lastAt < 700) return Promise.resolve();
      inFlightPinsRef.current.add(key);
      return chatHubService.pinLivestreamProductById(id, isPin).finally(() => {
        inFlightPinsRef.current.delete(key);
        lastPinAtRef.current.set(key, Date.now());
      });
    },
    updateStockById: (id, newStock) => {
      console.log("[DEBUG realtime] updateStockById called with id:", id, "newStock:", newStock);
      return chatHubService.updateLivestreamProductStockById(id, newStock);
    },
    deleteById: (id) => chatHubService.deleteLivestreamProductById(id),
    softDeleteById: (id, reason) => chatHubService.softDeleteLivestreamProductById(id, reason),

  // Keep available for seller-triggered explicit refresh; note: server currently broadcasts to entire group
  refreshPinned: () => liveRef.current ? chatHubService.getPinnedProducts(liveRef.current) : Promise.resolve(),
  refreshProducts: () => liveRef.current ? chatHubService.getLivestreamProducts(liveRef.current) : Promise.resolve(),

    getSummary: () => {
      if (!liveRef.current) {
        return {
          livestreamId: '',
          uniqueViewers: 0,
          peakCustomerViewers: 0,
          lastTotalViewers: 0,
          lastViewersByRole: {},
          endedAt: new Date().toISOString(),
        };
      }
      return chatHubService.getEndOfLiveSummary(liveRef.current);
    },
  }), [viewerStats, pinnedProducts, products, lastAdded, lastRemoved, lastUpdated, lastPinChange, lastStockChange, uniqueViewerCount]);

  return api;
}
