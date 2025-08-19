import { useEffect, useMemo, useRef, useState } from 'react';
import { chatHubService, ViewerStatsPayload, ProductAddedEvent, ProductEventBase, ProductPinStatusChangedEvent, ProductStockUpdatedEvent, PinnedProductsUpdatedEvent } from './chatHub';

export interface LivestreamRealtimeState {
  viewerStats: ViewerStatsPayload | null;
  pinnedProducts: unknown[];
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
        chatHubService.onProductAdded((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastAdded(ev);
        });
        chatHubService.onProductRemoved((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastRemoved(ev);
        });
        chatHubService.onLivestreamProductUpdated((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastUpdated(ev);
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
        });
        chatHubService.onLivestreamProductStockUpdated((ev) => {
          if (!mounted) return;
          if (ev.livestreamId !== livestreamId) return;
          setLastStockChange(ev);
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
    updateStockById: (id, newStock) => chatHubService.updateLivestreamProductStockById(id, newStock),
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
  }), [viewerStats, pinnedProducts, lastAdded, lastRemoved, lastUpdated, lastPinChange, lastStockChange, uniqueViewerCount]);

  return api;
}
