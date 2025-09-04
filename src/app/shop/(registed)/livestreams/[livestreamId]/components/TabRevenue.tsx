"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Package,
  BarChart3,
  Eye
} from "lucide-react";
import Image from "next/image";
import { getLivestreamRevenue, type LivestreamRevenueData } from "@/services/api/livestream/revenue";

interface TabRevenueProps {
  livestreamId: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function TabRevenue({ livestreamId }: TabRevenueProps) {
  const [revenueData, setRevenueData] = useState<LivestreamRevenueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLivestreamRevenue(livestreamId);
      setRevenueData(data);
    } catch (e) {
      console.error("Load livestream revenue error", e);
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [livestreamId]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats Cards */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-4 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Không thể tải dữ liệu</h3>
        <p className="text-gray-500">{error}</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Statistics Cards - 1/4 */}
      <div className="lg:col-span-1">
        <div className="space-y-4">
          {/* Total Revenue */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatPrice(revenueData?.totalRevenue || 0)}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </Card>

          {/* Total Orders */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-blue-800">
                  {revenueData?.totalOrders || 0}
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <ShoppingCart className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </Card>

          {/* Products Sold */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Sản phẩm đã bán</p>
                <p className="text-2xl font-bold text-purple-800">
                  {revenueData?.productsWithOrders?.length || 0}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {revenueData?.productsWithOrders?.reduce((sum, p) => sum + p.quantity, 0) || 0} sản phẩm
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <Package className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </Card>

          {/* Average Order Value */}
          {revenueData && revenueData.totalOrders > 0 && (
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium mb-1">Giá trị TB/đơn</p>
                  <p className="text-xl font-bold text-orange-800">
                    {formatPrice(revenueData.totalRevenue / revenueData.totalOrders)}
                  </p>
                </div>
                <div className="bg-orange-200 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Products with Orders - 3/4 */}
      <div className="lg:col-span-3">
        <Card className="p-6 bg-gray-50 shadow-md rounded-lg h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-3">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Sản phẩm đã bán
                </h3>
                <p className="text-gray-500">
                  {revenueData?.productsWithOrders?.length || 0} sản phẩm có đơn hàng
                </p>
              </div>
            </div>
          </div>

          {revenueData?.productsWithOrders && revenueData.productsWithOrders.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {revenueData.productsWithOrders.map((product, index) => (
                <Card
                  key={`${product.productId}-${product.variantName || 'default'}`}
                  className="bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-4">
                    {/* Ranking */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="flex-shrink-0">
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
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                        {product.productName}
                      </h4>
                      {product.variantName && (
                        <p className="text-sm text-gray-500 mb-1">
                          Phân loại: {product.variantName}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600">
                          Giá: {formatPrice(product.price)}
                        </span>
                        <Badge variant="outline" className="text-blue-600">
                          <Eye className="w-3 h-3 mr-1" />
                          SL: {product.quantity}
                        </Badge>
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatPrice(product.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Doanh thu
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-700 mb-3 text-lg">
                Chưa có đơn hàng
              </h4>
              <p className="text-gray-500">
                Livestream này chưa có đơn hàng nào được tạo.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
