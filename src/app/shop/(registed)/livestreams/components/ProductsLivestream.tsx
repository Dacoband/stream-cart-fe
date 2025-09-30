"use client";
import React, { useEffect, useState } from "react";
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Product, Variant } from "@/types/product/product";
import { getProductDetailById } from "@/services/api/product/product";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import DialogProduct from "./DialogProduct";
import { CreateLivestreamProduct } from "@/types/livestream/livestream";

interface Props {
  value?: CreateLivestreamProduct[];
  onChange?: (val: CreateLivestreamProduct[]) => void;
}

type ProductRow = {
  productId: string;
  variantId: string | null;
  price: number;
  stock: number;
  isPin: boolean;
  productName: string;
  productImage: string;
  basePrice: number;
  variantName?: string;
};

function ProductsLivestream({ onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [variantsMap, setVariantsMap] = useState<Record<string, Variant[]>>({});

  // Sync to parent
  useEffect(() => {
    const payload: CreateLivestreamProduct[] = productRows.map((row) => ({
      productId: row.productId,
      variantId: row.variantId ?? null,
      price: row.price,
      stock: row.stock,
      isPin: false,
    }));

    onChange?.(payload);
  }, [productRows, onChange]);

  const handleConfirm = async (products: Product[]) => {
    // Merge newly selected base products with existing selectedProducts list
    setSelectedProducts((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      for (const p of products) byId.set(p.id, p);
      return Array.from(byId.values());
    });

    // Prepare new variant rows for only those not already present
    const newVariantsMap: Record<string, Variant[]> = { ...variantsMap };
    const additions: ProductRow[] = [];

    await Promise.all(
      products.map(async (product) => {
        let variants: Variant[] = [];

        if (product.hasVariant) {
          const detail = await getProductDetailById(product.id);
          variants = detail.variants || [];
          newVariantsMap[product.id] = variants;
        } else {
          variants = [
            {
              variantId: null,
              attributeValues: {},
              price: product.finalPrice,
              stock: product.stockQuantity ?? 0,
              weight: 0,
              length: 0,
              width: 0,
              height: 0,
              finalPrice: product.finalPrice,
              flashSalePrice: 0,
              variantImage: { imageId: "", url: "", altText: "" },
            },
          ];
        }

        variants.forEach((variant) => {
          const exists = productRows.some(
            (r) =>
              r.productId === product.id &&
              r.variantId === (variant.variantId ?? null)
          );
          if (!exists) {
            additions.push({
              productId: product.id,
              variantId: variant.variantId ?? null,
              price: variant.price,
              stock: 1,
              isPin: false,
              productName: product.productName,
              productImage: product.primaryImageUrl,
              basePrice: variant.price,
              variantName: variant.variantId
                ? Object.values(variant.attributeValues).join(" / ")
                : "",
            });
          }
        });
      })
    );

    // Append only new rows to preserve user edits in existing rows
    setVariantsMap(newVariantsMap);
    setProductRows((prev) => [...prev, ...additions]);
  };

  const handleRowChange = (
    idx: number,
    field: keyof CreateLivestreamProduct,
    val: string | number | boolean
  ) => {
    const newRows = [...productRows];
    newRows[idx] = { ...newRows[idx], [field]: val };
    setProductRows(newRows);
  };

  const handleRemoveRow = (idx: number) => {
    const newRows = productRows.filter((_, i) => i !== idx);
    setProductRows(newRows);
  };

  return (
    <div>
      <FormLabel className="text-base font-medium flex items-center gap-1">
        <span className="text-red-500 text-lg">*</span>
        Sản phẩm cho Livestream
      </FormLabel>

      <Button type="button" onClick={() => setOpen(true)} className="my-2">
        Chọn sản phẩm
      </Button>

      <DialogProduct
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />

      <div className="overflow-x-auto mt-2">
        <table className="min-w-full border text-sm bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Sản phẩm</th>
              <th className="border px-3 py-2">Phân loại</th>
              <th className="border px-3 py-2">Giá gốc</th>
              <th className="border px-3 py-2">Kho</th>
              <th className="border px-3 py-2">Giá trong live</th>
              <th className="border px-3 py-2">Số lượng</th>
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
                const stockInWarehouse =
                  row.variantId && variantsMap[row.productId]
                    ? variantsMap[row.productId].find(
                        (v) => v.variantId === row.variantId
                      )?.stock ?? 0
                    : selectedProducts.find((p) => p.id === row.productId)
                        ?.stockQuantity ?? 0;

                const invalidStock =
                  row.stock <= 0 || row.stock > stockInWarehouse;

                return (
                  <tr key={`${row.productId}-${row.variantId ?? "no-variant"}`}>
                    <td className="border px-3 py-2 flex items-center gap-2">
                      <Image
                        src={row.productImage}
                        alt={row.productName}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <span>{row.productName}</span>
                    </td>
                    <td className="border px-3 py-2">
                      {row.variantName || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="border px-3 py-2 text-center text-gray-500">
                      {row.basePrice.toLocaleString()}₫
                    </td>
                    <td className="border px-3 py-2 text-center">
                      {stockInWarehouse}
                    </td>
                    <td className="border px-3 py-2">
                      <Input
                        type="number"
                        className="w-24"
                        value={row.price}
                        min={0}
                        onChange={(e) =>
                          handleRowChange(idx, "price", Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="border px-3 py-2">
                      <Input
                        type="number"
                        className={`w-16 ${
                          invalidStock ? "border-red-500" : ""
                        }`}
                        value={row.stock}
                        min={1}
                        max={stockInWarehouse}
                        onChange={(e) =>
                          handleRowChange(idx, "stock", Number(e.target.value))
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

export default ProductsLivestream;
