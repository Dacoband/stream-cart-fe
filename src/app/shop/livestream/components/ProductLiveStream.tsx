"use client";

import React from "react";
import { ProductLiveStream } from "@/types/livestream/productLivestream";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  getProductByLiveStreamId,
  updatePinProductLiveStream,
} from "@/services/api/livestream/productLivestream";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Edit, ImageIcon, Pin, PinOff, Search, Trash2 } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";

type ProductsProps = {
  livestreamId: string;
  onPinnedChange?: (pinned: ProductLiveStream | null) => void;
  refreshFlag?: boolean; // toggle to force refetch from parent
};

function ProductsLiveStream({ livestreamId, onPinnedChange, refreshFlag }: ProductsProps) {
  const [products, setProducts] = React.useState<ProductLiveStream[]>([]);
  const [search, setSearch] = React.useState("");
  const [pinLoadingId, setPinLoadingId] = React.useState<string | null>(null);

  const fetchProducts = React.useCallback(async () => {
    const data = await getProductByLiveStreamId(livestreamId);
    setProducts(data);
    // inform parent about current pinned item
    const currentPinned = Array.isArray(data)
      ? (data as ProductLiveStream[]).find((p) => p.isPin)
      : undefined;
    onPinnedChange?.(currentPinned || null);
  }, [livestreamId, onPinnedChange]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Refetch when parent indicates external pin/unpin happened
  React.useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFlag]);

  const handleTogglePin = async (product: ProductLiveStream) => {
    const newIsPin = !product.isPin;
    try {
      setPinLoadingId(product.id);
      await updatePinProductLiveStream(product.id, newIsPin);
      // Update local list: only one item should be pinned at a time
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, isPin: newIsPin }
            : newIsPin
            ? { ...p, isPin: false }
            : p
        )
      );
      onPinnedChange?.(newIsPin ? { ...product, isPin: true } : null);
    } finally {
      setPinLoadingId(null);
    }
  };

  // Lọc sản phẩm theo tên
  const filteredProducts = products.filter((p) =>
    p.productName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="bg-white border h-full rounded-none py-0 gap-0 flex flex-col">
      <CardTitle className="border-b py-4 text-black text-center">
        Sản phẩm
      </CardTitle>

      {/* Thanh tìm kiếm */}
      <div className="px-4 py-2 border-b flex items-center gap-2 sticky top-0 bg-white z-10">
        <Search className="text-gray-500 w-4 h-4" />
        <Input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8"
        />
      </div>

      {/* Danh sách sản phẩm */}
      <CardContent className="overflow-y-auto flex-1 mt-5 px-2 space-y-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card key={product.id} className=" py-2 px-2 rounded-none gap-2 ">
              <div className="flex justify-between border-b pb-1">
                <Button
                  onClick={() => handleTogglePin(product)}
                  disabled={pinLoadingId === product.id}
                  className="bg-[#B0F847]/90 text-black rounded-full h-8 w-8  cursor-pointer flex items-center justify-center hover:bg-[#B0F847]/70 disabled:opacity-50"
                >
                  {product.isPin ? <PinOff size={16} /> : <Pin size={16} />}
                </Button>

                <div>
                  <Button className=" text-blue-500 bg-white rounded-none cursor-pointer shadow-none hover:bg-white hover:text-blue-400">
                    <Edit /> Chỉnh sửa
                  </Button>
                  <Button className=" text-red-500 bg-white rounded-none cursor-pointer shadow-none hover:bg-white hover:text-red-400">
                    <Trash2 /> Xóa
                  </Button>
                </div>
              </div>
              <div className="flex gap-3">
                {product.productImageUrl ? (
                  <Image
                    height={85}
                    width={85}
                    src={product.productImageUrl}
                    alt={product.productName}
                    className="rounded object-cover h-[85px] w-[85px]"
                  />
                ) : (
                  <div className="h-[85px] w-[85px] bg-gray-200 flex items-center justify-center rounded">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 flex flex-col items-start">
                  <h3 className="font-medium text-sm mb-2 line-clamp-1">
                    {product.productName}
                  </h3>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  {product.variantName && (
                    <p className="text-xs text-gray-500">
                      Phân loại: {product.variantName}
                    </p>
                  )}
                  <p className="text-red-500 font-semibold mt-2">
                    <PriceTag value={product.price} />
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm mt-4">
            Không tìm thấy sản phẩm
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default ProductsLiveStream;
