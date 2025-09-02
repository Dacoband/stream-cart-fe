"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { getProductForFlashSale } from "@/services/api/product/flashSale";
import { ProductWithoutFlashSale } from "@/types/product/flashSale";
import PriceTag from "@/components/common/PriceTag";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    rows: {
      productId: string;
      variantId: string | null;
      price: number;
      stock: number;
      productName: string;
      productImage: string;
      basePrice: number;
      variantName?: string;
      warehouseStock: number;
    }[]
  ) => void;
  date?: Date;
  slot?: number | null;
  preselectedKeys?: string[];
};

type VariantCard = {
  key: string;
  productId: string;
  variantId: string | null;
  title: string;
  image: string;
  basePrice: number;
  stock: number;
  variantName?: string;
};

function DialogProductFS({
  open,
  onClose,
  onConfirm,
  date,
  slot,
  preselectedKeys = [],
}: Props) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductWithoutFlashSale[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setSelected(new Set(preselectedKeys));
  }, [open, preselectedKeys]);

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      if (!date || slot == null) return;
      setLoading(true);
      try {
        const res = await getProductForFlashSale(date, slot);
        const list: ProductWithoutFlashSale[] =
          (res?.data?.data as ProductWithoutFlashSale[]) ||
          (res?.data as ProductWithoutFlashSale[]) ||
          [];
        setProducts(list);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, date, slot]);

  const cards: VariantCard[] = useMemo(() => {
    const arr: VariantCard[] = [];
    const seen = new Set<string>();
    products.forEach((p) => {
      const pid = p.id;
      if (!pid) return;

      const pushCard = (
        variantId: string | null,
        basePrice: number,
        stock: number,
        variantName?: string
      ) => {
        const key = `${pid}::${variantId ?? "null"}`;
        if (seen.has(key)) return;
        seen.add(key);
        arr.push({
          key,
          productId: pid,
          variantId,
          title: p.productName,
          image: p.productImageUrl,
          basePrice,
          stock,
          variantName,
        });
      };

      if (Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach((v) => {
          const vid = v.id ?? null;
          const price = Number(v.price) || 0;
          const stock = Number(v.stock) || 0;
          pushCard(vid, price, stock, v.variantName);
        });
      } else {
        const price = Number(p.basePrice) || 0;
        const stock = Number(p.stockQuantity) || 0;
        pushCard(null, price, stock);
      }
    });
    return arr;
  }, [products]);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return s;
    });
  };

  const handleConfirm = () => {
    const selectedCards = cards.filter((c) => selected.has(c.key));
    const rows = selectedCards.map((c) => ({
      productId: c.productId,
      variantId: c.variantId,
      price: c.basePrice,
      stock: 1,
      isPin: false,
      productName: c.title,
      productImage: c.image,
      basePrice: c.basePrice,
      variantName: c.variantName,
      warehouseStock: c.stock,
    }));
    onConfirm(rows);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-[45vw] !max-w-[45vw]">
        <DialogHeader>
          <DialogTitle>Chọn sản phẩm Flash Sale</DialogTitle>
        </DialogHeader>

        {!date || slot == null ? (
          <div className="p-4 text-sm text-gray text-center">
            Vui lòng chọn ngày và khung giờ trước khi chọn sản phẩm.
          </div>
        ) : loading ? (
          <div className="p-4">Đang tải sản phẩm…</div>
        ) : (
          <div className="max-h-[65vh] w-full overflow-y-auto pr-1 ">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 p-4 gap-4">
              {cards.map((card) => (
                <div
                  key={card.key}
                  className={`border relative rounded-none mb-2 flex flex-col items-center shadow hover:shadow-md cursor-pointer ${
                    selected.has(card.key) ? "ring-1 ring-gray-800" : ""
                  }`}
                  onClick={() => toggle(card.key)}
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        className="bg-white w-6 h-6 rounded-none"
                        checked={selected.has(card.key)}
                        onCheckedChange={() => toggle(card.key)}
                      />
                    </div>
                  </div>
                  <div className="p-2 w-full">
                    <p className="font-medium line-clamp-2">{card.title}</p>
                    {card.variantName && (
                      <p className="text-xs text-gray-500 mt-1">
                        {card.variantName}
                      </p>
                    )}
                    <p className="text-sm mt-2 text-rose-600">
                      <PriceTag value={card.basePrice} />
                    </p>
                    <p className="text-xs text-gray-500">Kho: {card.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={!date || slot == null}>
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DialogProductFS;
