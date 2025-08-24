"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { livestreamCartClient, type LivestreamCartData, type CartUpdatedAction, type CartUpdatedPayload } from "./livestreamCartClient";

export type LastCartEvent = {
  action: CartUpdatedAction;
  productName?: string;
  quantity?: number;
  timestamp?: string;
  message?: string;
} | null;

export function useLivestreamCart(livestreamId?: string) {
  const [cart, setCart] = useState<LivestreamCartData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<LastCartEvent>(null);

  const liveRef = useRef(livestreamId);
  liveRef.current = livestreamId;

  useEffect(() => {
    if (!livestreamId) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        await livestreamCartClient.ensureReady(livestreamId);
        const offLoaded = livestreamCartClient.onLoaded((c) => {
          if (!mounted) return;
          setCart(c);
        });
        const offUpdated = livestreamCartClient.onUpdated((action, c, raw) => {
          if (!mounted) return;
          setCart(c);
          const r = raw as CartUpdatedPayload;
          setLastEvent({
            action,
            productName: r?.ProductName ?? r?.productName,
            quantity: r?.Quantity ?? r?.quantity,
            timestamp: r?.Timestamp ?? r?.timestamp,
            message: r?.Message ?? r?.message,
          });
        });
        const offError = livestreamCartClient.onError((msg) => {
          if (!mounted) return;
          setError(msg);
        });

        await livestreamCartClient.loadCart(livestreamId);

        return () => {
          offLoaded();
          offUpdated();
          offError();
        };
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [livestreamId]);

  const addOne = useCallback(async (livestreamProductId: string) => {
    if (!liveRef.current) return;
    await livestreamCartClient.addToCart(liveRef.current, livestreamProductId, 1);
  }, []);

  const updateQty = useCallback(async (cartItemId: string, newQty: number) => {
    await livestreamCartClient.updateItemQuantity(cartItemId, newQty);
  }, []);

  const deleteItem = useCallback(async (cartItemId: string) => {
    await livestreamCartClient.deleteItem(cartItemId);
  }, []);

  return useMemo(
    () => ({ cart, loading, error, addOne, updateQty, deleteItem, lastEvent }),
    [cart, loading, error, addOne, updateQty, deleteItem, lastEvent]
  );
}

export type UseLivestreamCartReturn = ReturnType<typeof useLivestreamCart>;
