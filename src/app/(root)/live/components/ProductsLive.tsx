"use client";

import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Check, ImageIcon, Search, ShoppingCart } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";
import { useLivestreamProducts } from "@/services/signalr/useLivestreamProducts";
import { useLivestreamCart } from "@/services/signalr/useLivestreamCart";
import { toast } from "sonner";
function ProductsLive({ livestreamId }: { livestreamId: string }) {
  const [search, setSearch] = React.useState("");
  const { products, loading, error } = useLivestreamProducts(livestreamId);
  const { cart, addOne } = useLivestreamCart(livestreamId);

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
      <CardContent className="overflow-y-auto flex-1 mt-5 mb-5 px-2 space-y-3">
        {loading && (
          <p className="text-center text-gray-500 text-sm mt-4">
            Đang tải sản phẩm…
          </p>
        )}
        {error && (
          <p className="text-center text-red-600 text-sm mt-2">{error}</p>
        )}
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const inCart = !!cart?.items.find(
              (it) => it.livestreamProductId === product.id
            );
            return (
              <Card key={product.id} className="py-3 px-3 rounded-none">
                <div className="flex gap-3">
                  <div className="w-[85px] h-[85px] aspect-square flex-shrink-0">
                    {product.productImageUrl ? (
                      <Image
                        src={product.productImageUrl}
                        alt={product.productName}
                        width={85}
                        height={85}
                        className="rounded object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-1">
                        {product.productName}
                      </h3>
                      {product.variantName && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          Phân loại: {product.variantName}
                        </p>
                      )}{" "}
                      {product.sku && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          SKU: {product.sku}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end justify-between my-2">
                      <div className="flex items-end gap-2">
                        <p className="text-red-500 font-semibold mt-2">
                          <PriceTag value={product.price} />
                        </p>
                        {product.originalPrice !== product.price && (
                          <p className="text-gray-500 font-semibold mt-2 line-through">
                            <PriceTag value={product.originalPrice} />
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Còn: {product.stock}
                      </p>
                    </div>
                    <div className="flex justify-end ">
                      <Button
                        size="sm"
                        disabled={inCart} // khi đã mua thì disable luôn
                        className={`text-[12px] py-1 cursor-pointer px-2 rounded-none h-fit font-semibold 
    ${
      inCart
        ? "bg-green-500 border border-green-600 text-white" // giống nút kế bên
        : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
    }`}
                        onClick={async () => {
                          try {
                            await addOne(product.id);
                            toast.success("Đã thêm vào giỏ hàng", {
                              position: "bottom-center",
                            });
                          } catch (e) {
                            console.error("[UI] Add to cart failed", {
                              livestreamProductId: product.id,
                              error: e,
                            });
                            toast.error("Không thể thêm vào giỏ hàng", {
                              position: "bottom-center",
                            });
                          }
                        }}
                      >
                        {inCart ? "Đã mua" : "Thêm giỏ hàng"}
                      </Button>

                      <Button
                        size="sm"
                        className={`py-1 cursor-pointer px-5 rounded-none hover:bg-white h-full border font-semibold ${
                          inCart
                            ? "bg-green-50 border-green-600 text-green-700"
                            : "bg-white border-orange-600 text-orange-600"
                        }`}
                        disabled={inCart}
                        onClick={async () => {
                          try {
                            await addOne(product.id);
                            toast.success("Đã thêm vào giỏ hàng", {
                              position: "bottom-center",
                            });
                          } catch (e) {
                            console.error("[UI] Add to cart failed", {
                              livestreamProductId: product.id,
                              error: e,
                            });
                            toast.error("Không thể thêm vào giỏ hàng", {
                              position: "bottom-center",
                            });
                          }
                        }}
                      >
                        {inCart ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
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
