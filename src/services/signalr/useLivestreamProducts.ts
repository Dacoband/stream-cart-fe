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
    console.log("[DEBUG] useLivestreamProducts effect starting for:", livestreamId);
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        console.log("[DEBUG] Calling ensureReady...");
        await livestreamProductsClient.ensureReady(livestreamId);
        console.log("[DEBUG] ensureReady completed, setting up listeners...");
        const offLoaded = livestreamProductsClient.onLoaded((lid, list) => {
          console.log("[DEBUG] onLoaded received for livestreamId:", lid, "with", list.length, "products");
          if (!mounted || String(lid) !== String(livestreamId)) return;
          setProducts(list);
        });
        const offError = livestreamProductsClient.onError((msg) => {
          console.log("[DEBUG] onError received:", msg);
          if (!mounted) return;
          setError(msg);
        });

        const offStock = livestreamProductsClient.onStockUpdated((p: ProductStockUpdatedPayload) => {
          console.log("[DEBUG] 🎯 STOCK UPDATE EVENT RECEIVED! Payload:", p);
          console.log("[DEBUG] 🎯 Event timestamp:", new Date().toISOString());
          if (!mounted) return;
          // Cast to access both upper and lowercase properties
          const payload = p as Record<string, unknown>;
          // update by livestream product id (Id)
          const targetId = String(payload?.["Id"] ?? payload?.["id"] ?? "");
          const newStock = Number(payload?.["NewStock"] ?? payload?.["newStock"] ?? NaN);
          console.log("[DEBUG] Extracted targetId:", targetId, "newStock:", newStock);
          
          if (targetId) {
            console.log("[DEBUG] 🎯 Updating stock for product:", targetId, "newStock:", newStock);
            console.log("[DEBUG] Current products before update:", products.map(p => ({id: p.id, stock: p.stock, name: p.productName})));
            setProducts((prev) => {
              const updated = prev.map((it) => (it.id === targetId ? { ...it, stock: Number.isFinite(newStock) ? newStock : it.stock } : it));
              console.log("[DEBUG] 🎯 Products after stock update:", updated.map(p => ({id: p.id, stock: p.stock, name: p.productName})));
              return updated;
            });
            return;
          }
          // fallback: update by (productId, variantId) if Id not provided
          const pid = String(payload?.["ProductId"] ?? payload?.["productId"] ?? "");
          const vid = payload?.["VariantId"] ?? payload?.["variantId"];
          const vidStr = vid == null ? "" : String(vid);
          if (!pid) return;
          console.log("[DEBUG] Updating by productId+variantId:", pid, vidStr, "newStock:", newStock);
          setProducts((prev) => {
            const next = prev.map((it) => {
              const itVid = it.variantId == null ? "" : String(it.variantId);
              if (it.productId === pid && itVid === vidStr) {
                console.log("[DEBUG] Found matching product by productId+variantId, updating stock");
                return { ...it, stock: Number.isFinite(newStock) ? newStock : it.stock };
              }
              return it;
            });
            return next;
          });
        });

        const offDeleted = livestreamProductsClient.onDeleted((p: ProductDeletedPayload) => {
          console.log("[DEBUG] onDeleted received:", p);
          if (!mounted) return;
          const targetId = String(p?.Id ?? "");
          if (!targetId) return;
          setProducts((prev) => prev.filter((it) => it.id !== targetId));
        });

        // Call server; also uses return value as a fallback if event is delayed/missed
        console.log("[DEBUG] Loading products from server...");
        const mapped = await livestreamProductsClient.loadProducts(livestreamId);
        console.log("[DEBUG] Server returned products:", mapped.length);
        if (mounted && Array.isArray(mapped) && mapped.length) {
          console.log("[DEBUG] Setting initial products:", mapped.map(p => ({id: p.id, stock: p.stock, name: p.productName})));
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
