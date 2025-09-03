"use client";

import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
// realtime-first: use SignalR via useLivestreamRealtime; API fallback not needed here
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ImageIcon, Pin, Search } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";
import { useLivestreamProducts } from "@/services/signalr/useLivestreamProducts";

type ProductsProps = {
  livestreamId: string;
};

function ProductsLiveStream({ livestreamId }: ProductsProps) {
  const [search, setSearch] = React.useState("");
  const { products, loading, error } = useLivestreamProducts(livestreamId);

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
        {loading && (
          <p className="text-center text-gray-500 text-sm mt-4">
            Đang tải sản phẩm…
          </p>
        )}
        {error && (
          <p className="text-center text-red-600 text-sm mt-2">{error}</p>
        )}
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card key={product.id} className=" py-2 px-2 rounded-none gap-2 ">
              <div className="flex justify-between border-b pb-1">
                <div className="text-sm flex items-center text-gray-500">
                  Số lượng: {product.stock}
                </div>
                {product.isPin && (
                  <Button variant="outline" size="icon">
                    <Pin className="w-4 h-4" />
                  </Button>
                )}
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
                  <div className="flex gap-4">
                    <p className="text-red-500 font-semibold mt-2">
                      <PriceTag value={product.price} />
                    </p>
                    {product.originalPrice !== product.price && (
                      <p className="text-gray-500 font-semibold mt-2 line-through">
                        <PriceTag value={product.originalPrice} />
                      </p>
                    )}
                  </div>
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
