"use client";
import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getProductHasFilter } from "@/services/api/product/product";
import { useAuth } from "@/lib/AuthContext";
import { Product } from "@/types/product/product";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (products: Product[]) => void;
};

function DialogProduct({ open, onClose, onConfirm }: Props) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!user?.shopId) return;

      try {
        const res = await getProductHasFilter({ shopId: user.shopId });
        setProducts(res?.data?.items ?? []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.shopId]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selected = products.filter((p) => selectedProducts.has(p.id));
    onConfirm(selected);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Chọn sản phẩm</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="grid grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="border relative rounded-lg p-2 flex flex-col items-center text-center shadow hover:shadow-md"
                onClick={() => toggleProduct(product.id)}
              >
                <div className="relative w-full h-32">
                  <Image
                    src={product.primaryImageUrl}
                    alt={product.productName}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                  <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow">
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                  </div>
                </div>
                <p className="font-semibold mt-2">{product.productName}</p>
                <p className="text-sm text-gray-600">
                  {product.finalPrice.toLocaleString()}đ
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Xác nhận</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DialogProduct;
