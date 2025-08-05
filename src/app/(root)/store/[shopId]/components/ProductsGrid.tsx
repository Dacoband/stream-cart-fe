"use client";

import React, { useState, useEffect } from 'react';
import { ProductByShop, getProductsByShop, ProductFilter } from '@/services/api/product/productShop';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Package,
  ShoppingCart,
  ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingScreen from '@/components/common/LoadingScreen';
import PriceTag from '@/components/common/PriceTag';

interface ProductsGridProps {
  shopId: string;
}

function ProductsGrid({ shopId }: ProductsGridProps) {
  const [products, setProducts] = useState<ProductByShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false); // Riêng cho search
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<number>(0); // Đổi thành number theo API
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const fetchProducts = async (isSearching = false) => {
    try {
      // Chỉ show loading screen khi không phải search
      if (!isSearching) {
        setLoading(true);
      } else {
        setSearching(true);
      }
      
      const filter: ProductFilter = {
        pageNumber: currentPage,
        pageSize,
        sortOption: sortOption,
        activeOnly: true,
        categoryId: undefined, // Có thể thêm filter category sau
        inStockOnly: true,
      };

      const response = await getProductsByShop(shopId, filter);
      console.log('API Response:', response); // Debug log
      
      if (response.success && response.data) {
        let productsArray: ProductByShop[] = [];
        
        // Kiểm tra xem response.data có phải là array không (API gốc)
        if (Array.isArray(response.data)) {
          productsArray = response.data;
        } 
        // Kiểm tra search API structure: data.products.items
        else if (typeof response.data === 'object' && response.data !== null) {
          const data = response.data as { products?: { items?: ProductByShop[] }; items?: ProductByShop[] };
          
          if (data.products && data.products.items && Array.isArray(data.products.items)) {
            productsArray = data.products.items;
          } 
          // Fallback cho các structure khác
          else if (data.items && Array.isArray(data.items)) {
            productsArray = data.items;
          } 
          else {
            console.log('Response data structure:', data);
            productsArray = [];
          }
        }
        
        setProducts(productsArray);
      } else {
        console.error('API response error:', response.errors);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, currentPage, sortOption]);

  // Debounced search với UX mượt hơn
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts(true); // Pass true để đánh dấu đây là search
    }, 300); // Giảm debounce từ 500ms xuống 300ms để responsive hơn
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full bg-white">
      {/* Search & Filter Bar */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              searching ? 'text-orange-500 animate-pulse' : 'text-gray-400'
            }`} />
            <Input
              placeholder="Tìm kiếm sản phẩm trong shop..."
              className="pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <Select value={sortOption.toString()} onValueChange={(value) => setSortOption(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Mặc định</SelectItem>
              <SelectItem value="1">Bán chạy nhất</SelectItem>
              <SelectItem value="2">Giá thấp đến cao</SelectItem>
              <SelectItem value="3">Giá cao đến thấp</SelectItem>
              <SelectItem value="4">Mới nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span>Tìm thấy {Array.isArray(products) ? products.length : 0} sản phẩm</span>
          {searchTerm && (
            <span className="text-orange-500">cho &ldquo;{searchTerm}&rdquo;</span>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {!Array.isArray(products) || products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Package className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl">Không tìm thấy sản phẩm nào</p>
              <p className="text-sm">Shop này chưa có sản phẩm hoặc sản phẩm không khớp với từ khóa tìm kiếm</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-x-5 gap-y-10 transition-all duration-300 ${searching ? 'opacity-70' : 'opacity-100'}">
            {Array.isArray(products) && products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductByShop }) {
  // Handle cả isActive (API gốc) và inStock (search API)
  const isProductActive = product.isActive !== undefined ? product.isActive : (product.inStock ?? true);
  const productHasPrimaryImage = product.hasPrimaryImage !== undefined ? product.hasPrimaryImage : !!product.primaryImageUrl;
  const imageSource = productHasPrimaryImage && product.primaryImageUrl ? product.primaryImageUrl : '/assets/nodata.png';
  
  const hasDiscount = product.discountPrice > 0;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.basePrice - product.finalPrice) / product.basePrice) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group py-0 hover:shadow-xl rounded-none transition-all duration-300 border h-full bg-white overflow-hidden hover:-translate-y-1">
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative overflow-hidden">
            {imageSource && imageSource !== '/assets/nodata.png' ? (
              <Image
                src={imageSource}
                alt={product.productName}
                width={200}
                height={200}
                className="w-full h-52 object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="bg-gray-200 w-full flex items-center justify-center h-52 text-gray-400">
                <ImageIcon size={50} />
              </div>
            )}

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-2 right-2 bg-[#B7F560] text-black px-2 py-1 rounded text-xs font-bold">
                -{discountPercentage}%
              </div>
            )}

            {/* Out of Stock Overlay */}
            {!isProductActive && (
              <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center">
                <span className="text-white text-xs font-bold">Hết hàng</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="pt-2 px-3">
            {/* Product Name */}
            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[48px]">
              {product.productName}
            </h4>

            {/* Price and Sold Count */}
            <div className="mb-2 flex gap-5 justify-between items-end">
              <div className="flex items-center space-x-1">
                <span className="text-lg font-semibold text-[#7FB800]">
                  <PriceTag value={product.finalPrice} />
                </span>
              </div>
              {/* Sold Count */}
              <div className="text-xs text-gray-500 mb-2">
                Đã bán {product.quantitySold}
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full cursor-pointer bg-[#9FE040] hover:bg-[#9FE040]/80 text-white font-medium shadow-md rounded-none hover:shadow-lg transition-all duration-300"
            size="sm"
            disabled={!isProductActive || product.stockQuantity === 0}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {isProductActive ? 'Thêm vào giỏ' : 'Hết hàng'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProductsGrid;
