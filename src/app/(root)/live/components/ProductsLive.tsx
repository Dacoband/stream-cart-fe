"use client";

import React from "react";
import { ProductLiveStream } from "@/types/livestream/productLivestream";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getProductByLiveStreamId } from "@/services/api/livestream/productLivestream";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { ImageIcon, Search } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";

function ProductsLive({ livestreamId }: { livestreamId: string }) {
  const [products, setProducts] = React.useState<ProductLiveStream[]>([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProductByLiveStreamId(livestreamId);
      setProducts(data);
    };
    fetchProducts();
  }, [livestreamId]);

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
            <Card key={product.id} className="py-3 px-3 rounded-sm">
              <div className="flex gap-3">
                <div>
                  {product.productImageUrl ? (
                    <Image
                      height={85}
                      width={85}
                      src={product.productImageUrl}
                      alt={product.productName}
                      className="rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-[85px] w-[85px] bg-gray-200 flex items-center justify-center rounded flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h3 className="font-medium text-sm line-clamp-1">
                      {product.productName}
                    </h3>
                    {product.variantName && (
                      <p className="text-xs text-gray-500">
                        Phân loại: {product.variantName}
                      </p>
                    )}{" "}
                    {product.sku && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-red-600 font-semibold ">
                      <PriceTag value={product.price} />
                    </p>
                    <Button
                      size="sm"
                      className="text-[12px] py-0.5 px-2 rounded-none bg-gradient-to-r from-orange-500 to-red-500 hover:bg-[#B0F847]/80 font-semibold text-white"
                    >
                      Mua ngay
                    </Button>
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

export default ProductsLive;
