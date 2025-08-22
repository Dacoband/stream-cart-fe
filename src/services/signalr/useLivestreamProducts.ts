"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductLiveStream } from "@/types/livestream/productLivestream";
import { livestreamProductsClient, type ProductDeletedPayload, type ProductStockUpdatedPayload } from "./livestreamProductsClient";

export function useLivestreamProducts(livestreamId?: string) {
  const [products, setProducts] = useState<ProductLiveStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!livestreamId) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        await livestreamProductsClient.ensureReady(livestreamId);
        const offLoaded = livestreamProductsClient.onLoaded((lid, list) => {
          if (!mounted || String(lid) !== String(livestreamId)) return;
          setProducts(list);
        });
        const offError = livestreamProductsClient.onError((msg) => {
          if (!mounted) return;
          setError(msg);
        });

        const offStock = livestreamProductsClient.onStockUpdated((p: ProductStockUpdatedPayload) => {
          if (!mounted) return;
          // update by livestream product id (Id)
          const targetId = String(p?.Id ?? "");
          const newStock = Number(p?.NewStock ?? NaN);
          if (!targetId) return;
          setProducts((prev) => prev.map((it) => (it.id === targetId ? { ...it, stock: Number.isFinite(newStock) ? newStock : it.stock } : it)));
        });

        const offDeleted = livestreamProductsClient.onDeleted((p: ProductDeletedPayload) => {
          if (!mounted) return;
          const targetId = String(p?.Id ?? "");
          if (!targetId) return;
          setProducts((prev) => prev.filter((it) => it.id !== targetId));
        });

        // Call server; also uses return value as a fallback if event is delayed/missed
        const mapped = await livestreamProductsClient.loadProducts(livestreamId);
        if (mounted && Array.isArray(mapped) && mapped.length) {
          setProducts(mapped);
        }

        return () => {
          offLoaded();
          offError();
          offStock();
          offDeleted();
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

  return useMemo(() => ({ products, loading, error }), [products, loading, error]);
}

export type UseLivestreamProductsReturn = ReturnType<typeof useLivestreamProducts>;
