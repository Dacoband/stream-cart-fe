import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, ShoppingCart, Zap } from "lucide-react";
import Image from "next/image";
import React from "react";

function FlashSale() {
  return (
    <div className="flex flex-col px-10 py-5 w-full bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span>⚡ Flash Sale</span>
            </h2>
            <p className="text-gray-600 text-sm">
              Giảm giá sốc - Số lượng có hạn
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white font-bold px-12 py-3 rounded-md shadow hover:shadow-lg transition-all cursor-pointer duration-300 transform hover:scale-105">
          Xem thêm
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      <div className="grid grid-cols-6 gap-x-5 gap-y-10 pt-2 mb-5">
        <Card className="group py-0 hover:shadow-xl  rounded-none transition-all duration-300 border-0 bg-white overflow-hidden hover:-translate-y-1 cursor-pointer">
          <CardContent className="p-0">
            {/* Product Image */}
            <div className="relative overflow-hidden">
              <Image
                src="https://i.pinimg.com/736x/40/e5/a3/40e5a3c38746fbff18ddc0b30e47cfc6.jpg"
                alt="ok"
                width={200}
                height={200}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Flash Sale Badge */}
              <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                FLASH
              </div>

              {/* Discount */}
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                -10%
              </div>

              {/* Time Left */}
              <div className="absolute top-40 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>123</span>
              </div>
              {/* Product Info */}
              <div className="pt-2 px-3">
                {/* Product Name */}
                <h3 className="font-medium text-gray-900  mb-2 line-clamp-2">
                  Kem cống nắng
                </h3>

                {/* Price */}
                <div className="mb-2 flex gap-5 items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-semibold text-red-600">
                      120.000
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 line-through">
                    100000
                  </span>
                </div>

                {/* Sold Count */}
                <div className="text-xs text-gray-500 mb-2">Đã bán 200</div>
              </div>
              {/* Add to Cart Button */}
              <Button
                className="w-full rounded-none cursor-pointer bg-gradient-to-r from-red-500 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
                size="sm"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Mua ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FlashSale;
