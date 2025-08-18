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
import PriceTag from "@/components/common/PriceTag";

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
      <DialogContent className=" overflow-hidden">
        <DialogHeader>
          <DialogTitle>Chọn sản phẩm</DialogTitle>
        </DialogHeader>
        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : (
          <div className=" overflow-y-auto pr-1 overflow-x-hidden">
            <div className=" max-h-[70vh] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border relative rounded-none mb-2 flex flex-col items-center shadow hover:shadow-md"
                  onClick={() => toggleProduct(product.id)}
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={product.primaryImageUrl}
                      alt={product.productName}
                      fill
                      className="rounded-none object-cover"
                    />
                    <div className="absolute top-2 left-2 ">
                      <Checkbox
                        className="bg-white w-6 h-6 rounded-none"
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                    </div>
                  </div>
                  <div className="p-2 w-full flex flex-col justify-between h-full flex-1">
                    <p className="font-medium  line-clamp-2">
                      {product.productName}
                    </p>
                    <p className="text-sm mt-2 text-rose-600">
                      <PriceTag value={product.basePrice} />
                    </p>
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
          <Button onClick={handleConfirm}>Xác nhận</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DialogProduct;
