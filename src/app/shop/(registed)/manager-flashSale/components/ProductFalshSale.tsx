"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import DialogProductFS from "./DialogProductFS";
import PriceTag from "@/components/common/PriceTag";
interface Props {
  value?: {
    productId: string;
    variantId: string | null;
    price: number;
    stock: number;
  }[];
  onChange?: (
    val: {
      productId: string;
      variantId: string | null;
      price: number;
      stock: number;
    }[]
  ) => void;
  date?: Date;
  slot?: number | null;
}

type ProductRow = {
  productId: string;
  variantId: string | null;
  price: number | null;
  stock: number | null;
  productName: string;
  productImage: string;
  basePrice: number;
  variantName?: string;
  warehouseStock: number;
};

function ProductFlashSale({ onChange, date, slot }: Props) {
  const [open, setOpen] = useState(false);
  const [productRows, setProductRows] = useState<ProductRow[]>([]);

  useEffect(() => {
    const payload = productRows
      .filter((row) => {
        if (row.price === null || row.stock === null) return false;
        if (row.price >= row.basePrice) return false;
        if (row.stock <= 0 || row.stock > row.warehouseStock) return false;
        return true;
      })
      .map((row) => ({
        productId: row.productId,
        variantId: row.variantId ?? null,
        price: row.price as number,
        stock: row.stock as number,
      }));

    onChange?.(payload);
  }, [productRows, onChange]);

  const selectedKeys = useMemo(
    () =>
      new Set(
        productRows.map((r) => `${r.productId}::${r.variantId ?? "null"}`)
      ),
    [productRows]
  );
  const upsertRows = (rows: ProductRow[]) => {
    setProductRows((prev) => {
      const key = (r: ProductRow) => `${r.productId}::${r.variantId ?? "null"}`;
      const existing = new Map(prev.map((r) => [key(r), r]));
      for (const r of rows) {
        const k = key(r);
        if (!existing.has(k)) existing.set(k, r);
      }
      return Array.from(existing.values());
    });
  };

  const handleConfirm = (rows: ProductRow[]) => {
    upsertRows(rows);
  };

  const handleRemoveRow = (idx: number) => {
    const newRows = productRows.filter((_, i) => i !== idx);
    setProductRows(newRows);
  };

  const handleRowChange = (
    idx: number,
    field: "price" | "stock",
    value: number | null
  ) => {
    setProductRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        if (value === null || isNaN(value)) {
          return { ...r, [field]: null };
        }
        if (field === "price") {
          return { ...r, price: Math.max(0, value) };
        }

        const clamped = Math.max(
          1,
          Math.min(r.warehouseStock, Math.floor(value))
        );
        return { ...r, stock: clamped };
      })
    );
  };
  return (
    <div>
      <Button type="button" onClick={() => setOpen(true)} className="my-2">
        Chọn sản phẩm Flash Sale
      </Button>

      <DialogProductFS
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        date={date}
        slot={slot}
        preselectedKeys={[...selectedKeys]}
      />

      <div className="overflow-x-auto mt-2">
        <table className="min-w-full border text-sm bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Sản phẩm</th>
              <th className="border px-3 py-2">Phân loại</th>
              <th className="border px-3 py-2">Giá gốc</th>
              <th className="border px-3 py-2">Kho</th>
              <th className="border px-3 py-2">Giá Flash Sale</th>
              <th className="border px-3 py-2">Số lượng mở bán</th>
              <th className="border px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {productRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Chưa chọn sản phẩm nào
                </td>
              </tr>
            ) : (
              productRows.map((row, idx) => {
                const stockInWarehouse = row.warehouseStock;
                const invalidPrice =
                  row.price === null ||
                  row.price >= row.basePrice ||
                  row.price < 0;
                const invalidStock =
                  row.stock === null ||
                  row.stock <= 0 ||
                  row.stock > stockInWarehouse;

                return (
                  <tr key={`${row.productId}-${row.variantId ?? "no-variant"}`}>
                    <td className="border px-3 py-2 ">
                      <div className="flex items-center gap-2">
                        <Image
                          src={row.productImage}
                          alt={row.productName}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <span className="font-medium">{row.productName}</span>
                      </div>
                    </td>
                    <td className="border px-3 py-2">
                      {row.variantName || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="border px-3 py-2 text-center text-gray-500">
                      <PriceTag value={row.basePrice} />
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {stockInWarehouse}
                    </td>
                    <td className="border px-3 py-2">
                      <Input
                        type="number"
                        className={`w-full ${
                          invalidPrice ? "border-red-500" : ""
                        }`}
                        value={row.price ?? ""}
                        placeholder="VND"
                        step={500}
                        min={0}
                        max={
                          row.basePrice > 0
                            ? Math.max(0, row.basePrice - 1)
                            : undefined
                        }
                        onBlur={(e) => {
                          const val =
                            e.target.value === ""
                              ? null
                              : Number(e.target.value);
                          const fixed =
                            val !== null ? Math.round(val / 500) * 500 : null;
                          handleRowChange(idx, "price", fixed);
                        }}
                        onChange={(e) =>
                          handleRowChange(
                            idx,
                            "price",
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      />
                      {invalidPrice && (
                        <div className="text-xs text-red-500 mt-1">
                          Giá Flash Sale phải nhỏ hơn giá gốc
                        </div>
                      )}
                    </td>
                    <td className="border px-3 py-2">
                      <Input
                        type="number"
                        className={`w-full ${
                          invalidStock ? "border-red-500" : ""
                        }`}
                        value={row.stock ?? ""}
                        placeholder="Số lượng"
                        min={1}
                        max={stockInWarehouse}
                        onChange={(e) =>
                          handleRowChange(
                            idx,
                            "stock",
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      />
                      {invalidStock && (
                        <div className="text-xs text-red-500 mt-1">
                          1 - {stockInWarehouse}
                        </div>
                      )}
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRow(idx)}
                      >
                        <Trash2 className="text-red-500" size={18} />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductFlashSale;
