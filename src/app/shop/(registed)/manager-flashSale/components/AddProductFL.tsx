"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Box, Trash2 } from "lucide-react";
import DialogProductFS from "./DialogProductFS";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";
import { createFlashSale } from "@/services/api/product/flashSale";
import { toast } from "sonner";
type PickerRow = {
  productId: string;
  variantId: string | null;
  price: number;
  stock: number;
  productName: string;
  productImage: string;
  basePrice: number;
  variantName?: string;
  warehouseStock: number;
};

export type SelectedRow = {
  key: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productImage: string;
  basePrice: number;
  variantName?: string;
  warehouseStock: number;
  quantity: number;
  salePrice: number | null;
};

interface Props {
  date?: Date;
  slot?: number | null;
  onCreated?: () => void;
}

function AddProductFL({ date, slot, onCreated }: Props) {
  const [open, setOpen] = React.useState(false);
  const [openPicker, setOpenPicker] = React.useState(false);
  const [rows, setRows] = React.useState<SelectedRow[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) setOpenPicker(true);
    else setOpenPicker(false);
  }, [open]);

  const preselectedKeys = React.useMemo(() => rows.map((r) => r.key), [rows]);

  const upsertRows = (newRows: PickerRow[]) => {
    setRows((prev) => {
      const map = new Map(prev.map((r) => [r.key, r] as const));
      for (const r of newRows) {
        const key = `${r.productId}::${r.variantId ?? "null"}`;
        if (map.has(key)) continue;
        map.set(key, {
          key,
          productId: r.productId,
          variantId: r.variantId ?? null,
          productName: r.productName,
          productImage: r.productImage,
          basePrice: r.basePrice,
          variantName: r.variantName,
          warehouseStock: r.warehouseStock,
          quantity: 1,
          // Prefill like ProductFlashSale: initial salePrice shown as basePrice (will be invalid until lowered)
          salePrice: r.basePrice,
        });
      }
      return Array.from(map.values());
    });
  };

  const handleConfirmPicker = (picked: PickerRow[]) => {
    upsertRows(picked);
    setOpenPicker(false);
  };

  const handleQtyChange = (index: number, val: number | null) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        if (val === null || isNaN(val)) return { ...r, quantity: 0 };
        const clamped = Math.max(
          1,
          Math.min(r.warehouseStock, Math.floor(val))
        );
        return { ...r, quantity: clamped };
      })
    );
  };

  const handlePriceChange = (index: number, val: number | null) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        if (val === null || isNaN(val)) return { ...r, salePrice: null };
        return { ...r, salePrice: Math.max(0, val) };
      })
    );
  };

  const canCreate = React.useMemo(() => {
    if (!date || slot == null) return false;
    if (rows.length === 0) return false;
    return rows.every(
      (r) =>
        r.quantity > 0 &&
        r.quantity <= r.warehouseStock &&
        r.salePrice !== null &&
        r.salePrice > 0 &&
        r.salePrice < r.basePrice
    );
  }, [date, slot, rows]);

  const formatDate = (d: Date) => d.toLocaleDateString("sv-SE");

  const handleCreate = async () => {
    if (!canCreate || !date || slot == null) return;
    setSubmitting(true);
    try {
      const byProduct = new Map<
        string,
        { variantIds: Set<string>; minPrice: number; totalQty: number }
      >();
      for (const r of rows) {
        const g = byProduct.get(r.productId) ?? {
          variantIds: new Set<string>(),
          minPrice: Number.POSITIVE_INFINITY,
          totalQty: 0,
        };
        if (r.variantId) g.variantIds.add(r.variantId);
        // use entered salePrice
        if (typeof r.salePrice === "number") {
          g.minPrice = Math.min(g.minPrice, r.salePrice);
        }
        g.totalQty += r.quantity;
        byProduct.set(r.productId, g);
      }

      const products = Array.from(byProduct.entries()).map(
        ([productId, g]) => {
          const variantMap: Record<string, { price: number; quantity: number }> = {};
          
          // Nếu có variants thì tạo variantMap
          if (g.variantIds.size > 0) {
            for (const variantId of g.variantIds) {
              // Tìm row tương ứng với variant này để lấy price và quantity
              const variantRow = rows.find(r => r.productId === productId && r.variantId === variantId);
              if (variantRow && variantRow.salePrice !== null) {
                variantMap[variantId] = {
                  price: variantRow.salePrice,
                  quantity: variantRow.quantity
                };
              }
            }
          } else {
            // Nếu không có variant (null variant), tạo entry với productId
            const nullVariantRow = rows.find(r => r.productId === productId && r.variantId === null);
            if (nullVariantRow && nullVariantRow.salePrice !== null) {
              variantMap[productId] = {
                price: nullVariantRow.salePrice,
                quantity: nullVariantRow.quantity
              };
            }
          }
          
          return {
            productId,
            variantMap,
            flashSalePrice: g.minPrice === Number.POSITIVE_INFINITY ? 0 : g.minPrice,
            quantityAvailable: g.totalQty,
          };
        }
      );

      await createFlashSale({
        products,
        slot: slot,
        date: formatDate(date),
      });
      toast.success("Thêm sản phẩm vào Flash Sale thành công");
      setOpen(false);
      setRows([]);
      onCreated?.();
    } catch {
      toast.error("Thêm sản phẩm vào Flash Sale thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-[#B0F847] text-black shadow flex gap-2 text-sm py-1.5  px-5 font-medium  rounded-md h-fit items-center cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80">
        Thêm sản phẩm
      </DialogTrigger>
      <DialogContent className="!w-[52vw] !max-w-[45vw] min-h-[65vh] gap-0 m-0">
        <DialogTitle className="text-lg flex gap-2 font-semibold item-center">
          <div className="w-8 h-8 bg-[#B0F847] rounded-lg flex items-center justify-center">
            <Box className="w-4 h-4 text-black" />
          </div>{" "}
          Thêm sản phẩm
        </DialogTitle>

        <div className="w-full flex justify-end ">
          <Button
            variant="outline"
            onClick={() => setOpenPicker(true)}
            disabled={!date || slot == null}
          >
            Chọn sản phẩm
          </Button>
        </div>

        <div className=" ">
          <table className="min-w-full border text-sm bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Sản phẩm</th>
                <th className="border px-3 py-2">Phân loại</th>
                <th className="border px-3 py-2">Giá gốc</th>
                <th className="border px-3 py-2">Giá Flash Sale</th>
                <th className="border px-3 py-2">Kho</th>
                <th className="border px-3 py-2">Số lượng mở bán</th>
                <th className="border px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Chưa chọn sản phẩm nào
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const invalidQty =
                    row.quantity <= 0 || row.quantity > row.warehouseStock;
                  const invalidPrice =
                    row.salePrice === null ||
                    row.salePrice >= row.basePrice ||
                    row.salePrice <= 0;
                  return (
                    <tr key={row.key}>
                      <td className="border px-3  ">
                        <div className="flex items-center gap-2">
                          <Image
                            src={row.productImage}
                            alt={row.productName}
                            width={42}
                            height={42}
                            className="rounded"
                          />
                          <span className="font-medium line-clamp-2">
                            {row.productName}
                          </span>
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
                      <td className="border px-3 py-2">
                        <Input
                          type="number"
                          className={`w-full ${
                            invalidPrice ? "border-red-500" : ""
                          }`}
                          value={row.salePrice ?? ""}
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
                            handlePriceChange(idx, fixed);
                          }}
                          onChange={(e) =>
                            handlePriceChange(
                              idx,
                              e.target.value === ""
                                ? null
                                : Number(e.target.value)
                            )
                          }
                        />
                        {invalidPrice && (
                          <div className="text-xs text-red-500 mt-1">
                            Giá Sale phải nhỏ hơn giá gốc
                          </div>
                        )}
                      </td>
                      <td className="border px-3 py-2 text-center">
                        {row.warehouseStock}
                      </td>
                      <td className="border px-3 py-2">
                        <Input
                          type="number"
                          className={`w-full ${
                            invalidQty ? "border-red-500" : ""
                          }`}
                          value={row.quantity}
                          min={1}
                          max={row.warehouseStock}
                          onChange={(e) =>
                            handleQtyChange(
                              idx,
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                        />
                        {invalidQty && (
                          <div className="text-xs text-red-500 mt-1">
                            1 - {row.warehouseStock}
                          </div>
                        )}
                      </td>
                      <td className="border px-3 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setRows((prev) => prev.filter((_, i) => i !== idx))
                          }
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

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Đóng
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || submitting}>
            {submitting ? "Đang thêm..." : "Xác nhận"}
          </Button>
        </div>

        <DialogProductFS
          open={openPicker}
          onClose={() => setOpenPicker(false)}
          onConfirm={handleConfirmPicker}
          date={date}
          slot={slot}
          preselectedKeys={preselectedKeys}
        />
      </DialogContent>
    </Dialog>
  );
}

export default AddProductFL;
