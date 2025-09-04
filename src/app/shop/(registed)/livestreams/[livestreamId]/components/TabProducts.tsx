"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Loader2,
  ShoppingBag,
  Star,
  Award,
  TrendingUp,
  Edit,
} from "lucide-react";
import Image from "next/image";
import type { LivestreamProduct } from "@/types/livestream/livestream";
import UpdateStockModal from "./UpdateStockModal";

interface TabProductsProps {
  products: LivestreamProduct[];
  productsLoading: boolean;
  bestSellingProducts: LivestreamProduct[];
  bestSellingLoading: boolean;
  onProductsUpdate?: () => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function TabProducts({
  products,
  productsLoading,
  bestSellingProducts,
  bestSellingLoading,
  onProductsUpdate,
}: TabProductsProps) {
  const [selectedProduct, setSelectedProduct] = useState<LivestreamProduct | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const handleEditStock = (product: LivestreamProduct) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const handleStockUpdateSuccess = () => {
    onProductsUpdate?.();
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Best Selling Products - 1/4 */}
      <div className="lg:col-span-1">
        <Card className="p-6 bg-gray-50 shadow-md rounded-lg h-full">
          <div className="flex items-center mb-6">
            <div className="bg-orange-100 p-3 rounded-lg mr-3">
              <Crown className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Sản phẩm bán chạy
              </h3>
              <p className="text-sm text-gray-500">Top 4 sản phẩm</p>
            </div>
          </div>

          {bestSellingLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="w-full h-20 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : bestSellingProducts.length > 0 ? (
            <div className="space-y-4">
              {bestSellingProducts.map((product, index) => (
                <Card
                  key={product.id}
                  className="bg-white p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {product.productImageUrl ? (
                          <Image
                            src={product.productImageUrl}
                            alt={product.productName}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                        {product.productName}
                      </h4>
                      <div className="text-lg font-bold text-red-600">
                        {formatPrice(product.price)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>Bán chạy</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-gray-500">Chưa có dữ liệu bán chạy</p>
            </div>
          )}
        </Card>
      </div>

      {/* All Products - 3/4 */}
      <div className="lg:col-span-3">
        <Card className="p-6 bg-gray-50 shadow-md rounded-lg h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-3">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Tất cả sản phẩm
                </h3>
                <p className="text-gray-500">
                  {products.length} sản phẩm trong livestream
                </p>
              </div>
            </div>
            {productsLoading && (
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            )}
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card className="p-4 bg-white/50 border-0 rounded-xl">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </Card>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto custom-scrollbar">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white shadow-md rounded-lg"
                >
                  <div className="aspect-square relative">
                    {product.productImageUrl ? (
                      <Image
                        src={product.productImageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {product.isPin && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-yellow-500 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Ghim
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                        {product.stock ?? 0}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStock(product)}
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-white border-gray-300 shadow-sm"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-5">
                    <h4 className="font-bold text-base mb-2 line-clamp-2 text-gray-800">
                      {product.productName}
                    </h4>

                    <p className="text-sm text-gray-500 mb-3">
                      {product.variantName}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-red-600">
                          {formatPrice(product.price)}
                        </span>
                        {"originalPrice" in product &&
                        typeof (product as { originalPrice?: number })
                          .originalPrice === "number" &&
                        (product as { originalPrice: number }).originalPrice >
                          product.price ? (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(
                              (product as { originalPrice: number })
                                .originalPrice
                            )}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <Badge variant="outline" className="text-gray-600">
                          SKU:{" "}
                          {"sku" in product &&
                          typeof (product as { sku?: string }).sku === "string"
                            ? (product as { sku: string }).sku
                            : "-"}
                        </Badge>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock && product.stock > 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.stock && product.stock > 0
                            ? `Còn ${product.stock}`
                            : "Hết hàng"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-blue-500" />
              </div>
              <h4 className="font-bold text-gray-700 mb-3 text-lg">
                Chưa có sản phẩm
              </h4>
              <p className="text-gray-500">
                Livestream này chưa có sản phẩm nào được thêm vào.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Update Stock Modal */}
      <UpdateStockModal
        open={isStockModalOpen}
        product={selectedProduct}
        onClose={() => setIsStockModalOpen(false)}
        onSuccess={handleStockUpdateSuccess}
      />
    </div>
  );
}
