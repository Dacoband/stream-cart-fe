"use client";

import { Card } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { TrendingUp, Star } from "lucide-react";

interface BestSellingProduct {
  id: string;
  productName: string;
  primaryImageUrl?: string;
  finalPrice: number;
  basePrice?: number;
  discountPercentage?: number;
  quantitySold: number;
  shopName: string;
  rating?: number;
}

function BestSellingProducts() {
  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<BestSellingProduct[]>([]);

  React.useEffect(() => {
    const fetchBestSellingProducts = async () => {
      setLoading(true);
      try {
        // TODO: Gọi API thực tế: https://brightpa.me/api/products/bestselling?count=5
        const response = await fetch('https://brightpa.me/api/products/bestselling?count=5');
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        } else {
          throw new Error('API failed');
        }
      } catch (err) {
        console.error('Error fetching best selling products:', err);
        // Dữ liệu demo để test UI
        const demoProducts: BestSellingProduct[] = [
          {
            id: "1",
            productName: "iPhone 15 Pro Max 256GB Titanium",
            primaryImageUrl: "/assets/10.png",
            finalPrice: 29990000,
            basePrice: 32990000,
            discountPercentage: 9,
            quantitySold: 1250,
            shopName: "Tech Store Official",
            rating: 4.8
          },
          {
            id: "2",
            productName: "Áo thun basic nam nữ cotton 100%",
            primaryImageUrl: "/assets/11.png", 
            finalPrice: 199000,
            basePrice: 299000,
            discountPercentage: 33,
            quantitySold: 890,
            shopName: "Fashion House",
            rating: 4.6
          },
          {
            id: "3",
            productName: "Giày sneaker trắng unisex hot trend",
            primaryImageUrl: "/assets/12.png",
            finalPrice: 799000,
            basePrice: 1200000,
            discountPercentage: 33,
            quantitySold: 675,
            shopName: "Shoe Paradise",
            rating: 4.7
          },
          {
            id: "4",
            productName: "Túi xách nữ da thật cao cấp",
            primaryImageUrl: "/assets/13.png",
            finalPrice: 1299000,
            basePrice: 1899000,
            discountPercentage: 32,
            quantitySold: 456,
            shopName: "Luxury Bags",
            rating: 4.9
          },
          {
            id: "5",
            productName: "Đồng hồ nam thông minh smartwatch",
            primaryImageUrl: "/assets/14.png",
            finalPrice: 2499000,
            basePrice: 3499000,
            discountPercentage: 29,
            quantitySold: 423,
            shopName: "Watch World",
            rating: 4.5
          }
        ];
        setProducts(demoProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellingProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-xl flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Sản phẩm bán chạy
          </h3>
          <p className="text-gray-500 text-sm">Top 5 sản phẩm bán chạy nhất hệ thống</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-600 mb-2">Chưa có dữ liệu sản phẩm</h4>
            <p className="text-sm text-gray-500">Dữ liệu sản phẩm bán chạy sẽ hiển thị ở đây</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1 overflow-y-auto">
            {products.map((product, index) => (
            <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                {index + 1}
              </div>
              
              <div className="w-16 h-16 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                {product.primaryImageUrl ? (
                  <Image 
                    src={product.primaryImageUrl} 
                    alt={product.productName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate mb-1">{product.productName}</h4>
                <p className="text-xs text-gray-500 mb-1">{product.shopName}</p>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-red-600">
                    {formatPrice(product.finalPrice)}
                  </span>
                  {product.basePrice && product.basePrice > product.finalPrice && (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.basePrice)}
                      </span>
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                        -{product.discountPercentage}%
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    Đã bán: <span className="font-semibold">{product.quantitySold.toLocaleString()}</span>
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-gray-600">{product.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            ))}
          </div>

          {products.length > 0 && (
            <div className="mt-4 pt-4 border-t text-center flex-shrink-0">
              <div className="text-sm text-gray-500">
                Hiển thị {products.length} sản phẩm bán chạy nhất
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default BestSellingProducts;
