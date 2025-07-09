"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Product } from "@/types/product/product";
import { getBestSellingProducts } from "@/services/api/product/product";
import { ArrowRight, ShoppingCart, Sparkles, ImageIcon } from "lucide-react";
import LoadingCard from "./LoadingCard";
import PriceTag from "@/components/common/PriceTag";
function RecommendedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getBestSellingProducts();
        setProducts(data);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  return (
    <div className="flex flex-col px-10 py-5 w-full bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-[#B7F560] to-[#9FE040] rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span>✨ Đề xuất cho bạn</span>
            </h2>
            <p className="text-gray-600 text-sm">
              Sản phẩm được chọn lọc đặc biệt
            </p>
          </div>
        </div>
        <Button
          size="lg"
          className="bg-gradient-to-r from-[#B7F560] to-[#9bd741] hover:from-[#9bd741] hover:to-[#B7F560] text-white font-bold px-12 py-3 rounded-md shadow hover:shadow-lg transition-all cursor-pointer duration-300 transform hover:scale-105"
        >
          Xem thêm
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-6 gap-x-5 gap-y-10 pt-2 mb-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-x-5 gap-y-10 pt-2 mb-5">
          {products.map((item) => (
            <Link href={`/product/${item.id}`} key={item.id}>
              <Card
                key={item.id}
                className="group py-0 hover:shadow-xl  rounded-none transition-all duration-300 border-0 bg-white overflow-hidden hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    {item.primaryImageUrl ? (
                      <Image
                        src={item.primaryImageUrl}
                        alt={item.productName}
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="bg-gray-200 w-full flex items-center justify-center h-48 text-gray-400">
                        <ImageIcon size={50} />
                      </div>
                    )}

                    {/* Badge */}
                    {/* <div className="absolute top-2 left-2">
                      <span className={`${product.badgeColor} text-white px-2 py-1 rounded text-xs font-bold`}>
                        {product.badge}
                      </span>
                    </div> */}

                    {/* Discount */}
                    {item.discountPrice > 0 && (
                      <div className="absolute top-2 right-2 bg-[#B7F560] text-black px-2 py-1 rounded text-xs font-bold">
                        -{item.discountPrice}%
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="pt-2 px-3">
                    {/* Product Name */}
                    <h3 className="font-medium text-gray-900  mb-2 line-clamp-2">
                      {item.productName}
                    </h3>

                    {/* Price */}
                    <div className="mb-2 flex gap-5 justify-between items-end">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-semibold text-[#7FB800]">
                          <PriceTag value={item.finalPrice} />
                        </span>
                      </div>
                      {/* Sold Count */}
                      <div className="text-xs text-gray-500 mb-2">
                        Đã bán {item.quantitySold}
                      </div>
                    </div>
                  </div>
                  {/* Add to Cart Button */}
                  <Button
                    className="w-full cursor-pointer bg-[#9FE040] hover:bg-[#9FE040]/80  text-white font-medium shadow-md rounded-none hover:shadow-lg transition-all duration-300"
                    size="sm"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Thêm vào giỏ
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecommendedProducts;
