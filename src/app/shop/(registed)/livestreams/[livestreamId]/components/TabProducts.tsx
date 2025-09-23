"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, Edit, BarChart3 } from "lucide-react";
import Image from "next/image";
import type { LivestreamProduct } from "@/types/livestream/livestream";
import UpdateStockModal from "./UpdateStockModal";
import TabRevenue from "./TabRevenue";

interface TabProductsProps {
  livestreamId: string;
  products: LivestreamProduct[];
  productsLoading: boolean;
  onProductsUpdate?: () => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function TabProducts({
  livestreamId,
  products,
  productsLoading,
  onProductsUpdate,
}: TabProductsProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<LivestreamProduct | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "revenue">(
    "products"
  );

  const handleEditStock = (product: LivestreamProduct) => {
    setSelectedProduct(product);
    setIsStockModalOpen(true);
  };

  const handleStockUpdateSuccess = () => {
    onProductsUpdate?.();
  };
  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "products"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Sản phẩm trong Live
            </div>
          </button>
          <button
            onClick={() => setActiveTab("revenue")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "revenue"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Thống kê doanh thu
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "products" ? (
        /* Products Tab Content */
        <Card className="p-6 bg-gray-100 shadow-none rounded-lg">
          <div className="flex items-center justify-between ">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card className="p-3 bg-white/50 border-0 rounded-lg">
                    <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </Card>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg pt-0 pb-2 transition-shadow duration-300 bg-white shadow-sm gap-0 rounded-lg"
                >
                  <div className="aspect-square relative">
                    {product.productImageUrl ? (
                      <Image
                        src={product.productImageUrl}
                        alt={product.productName}
                        fill
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStock(product)}
                        className="w-8 h-8 p-0 bg-black/60 hover:bg-black/30 border-gray-300  text-white shadow-sm"
                      >
                        <Edit className="w-2.5 h-2.5 text-gray-white" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-gray-800">
                      {product.productName}
                    </h4>

                    {product.variantName && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {product.variantName}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">
                          {formatPrice(product.price)}
                        </span>
                        {"originalPrice" in product &&
                        typeof (product as { originalPrice?: number })
                          .originalPrice === "number" &&
                        (product as { originalPrice: number }).originalPrice >
                          product.price ? (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(
                              (product as { originalPrice: number })
                                .originalPrice
                            )}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex justify-between items-center">
                        <Badge
                          variant="outline"
                          className="text-gray-600 text-xs px-1 py-0"
                        >
                          {"sku" in product &&
                          typeof (product as { sku?: string }).sku === "string"
                            ? (product as { sku: string }).sku
                            : "N/A"}
                        </Badge>
                        <div
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
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
      ) : (
        /* Revenue Tab Content */
        <TabRevenue livestreamId={livestreamId} />
      )}

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
