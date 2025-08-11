"use client";

import React from "react";
import { ProductLiveStream } from "@/types/livestream/productLivestream";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getProductByLiveStreamId } from "@/services/api/livestream/productLivestream";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Edit, ImageIcon, Pin, PinOff, Search, Trash2 } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";

function ProductsLiveStream({ livestreamId }: { livestreamId: string }) {
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
            <Card key={product.id} className=" py-2 px-2 rounded-sm gap-2 ">
              <div className="flex justify-between border-b pb-1">
                <Button className="bg-[#B0F847]/90 text-black rounded-full h-8 w-8  cursor-pointer flex items-center justify-center hover:bg-[#B0F847]/70">
                  {product.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
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
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="h-[85px] w-[85px] bg-gray-200 flex items-center justify-center rounded">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 flex flex-col items-start">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {product.productName}
                  </h3>
                  <p className="text-red-500 font-semibold text-sm">
                    <PriceTag value={product.price} />
                  </p>
                  {product.variantName && (
                    <p className="text-xs text-gray-500">
                      Phân loại: {product.variantName}
                    </p>
                  )}
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
