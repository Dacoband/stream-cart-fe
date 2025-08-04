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
  ShoppingCart,
  Grid3X3,
  List,
  Package
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingScreen from '@/components/common/LoadingScreen';

interface ProductsGridProps {
  shopId: string;
}

function ProductsGrid({ shopId }: ProductsGridProps) {
  const [products, setProducts] = useState<ProductByShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('quantitySold');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const filter: ProductFilter = {
        shopId,
        pageNumber: currentPage,
        pageSize,
        searchTerm: searchTerm.trim() || undefined,
        sortBy: sortBy as 'productName' | 'basePrice' | 'finalPrice' | 'quantitySold' | 'createdAt',
        ascending: false,
        activeOnly: true, // Chỉ lấy sản phẩm đang hoạt động
      };

      const response = await getProductsByShop(filter);
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        console.error('API response error:', response.errors);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, currentPage, sortBy]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchProducts();
    }, 500);
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm sản phẩm trong shop..."
              className="pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quantitySold">Bán chạy nhất</SelectItem>
              <SelectItem value="productName">Tên A-Z</SelectItem>
              <SelectItem value="basePrice">Giá thấp đến cao</SelectItem>
              <SelectItem value="finalPrice">Giá bán thực tế</SelectItem>
              <SelectItem value="createdAt">Mới nhất</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Tìm thấy {products.length} sản phẩm
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Package className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl">Không tìm thấy sản phẩm nào</p>
              <p className="text-sm">Shop này chưa có sản phẩm hoặc sản phẩm không khớp với từ khóa tìm kiếm</p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: ProductByShop;
  viewMode: 'grid' | 'list';
}

function ProductCard({ product, viewMode }: ProductCardProps) {
  const hasDiscount = product.discountPrice > 0;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.basePrice - product.finalPrice) / product.basePrice) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/product/${product.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={product.hasPrimaryImage ? product.primaryImageUrl : '/assets/nodata.png'}
                  alt={product.productName}
                  fill
                  className="object-cover rounded"
                />
                {hasDiscount && (
                  <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-br">
                    -{discountPercentage}%
                  </div>
                )}
                {!product.isActive && (
                  <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center rounded">
                    <span className="text-white text-xs font-bold">Hết hàng</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.productName}
                </h3>
                
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                  <span className="text-sm text-gray-500">Đã bán: {product.quantitySold}</span>
                  <span className="text-sm text-gray-500">Còn lại: {product.stockQuantity}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold text-lg">
                      {formatPrice(product.finalPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-gray-500 line-through text-sm">
                        {formatPrice(product.basePrice)}
                      </span>
                    )}
                  </div>
                  
                  <Button size="sm" className="gap-1" disabled={!product.isActive || product.stockQuantity === 0}>
                    <ShoppingCart className="w-4 h-4" />
                    {product.isActive ? 'Thêm' : 'Hết hàng'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-3">
          <div className="relative aspect-square mb-3">
            <Image
              src={product.hasPrimaryImage ? product.primaryImageUrl : '/assets/nodata.png'}
              alt={product.productName}
              fill
              className="object-cover rounded"
            />
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{discountPercentage}%
              </div>
            )}
            {!product.isActive && (
              <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center rounded">
                <span className="text-white text-xs font-bold">Hết hàng</span>
              </div>
            )}
          </div>

          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm">
            {product.productName}
          </h3>

          <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
            <span>Đã bán: {product.quantitySold}</span>
            <span>Còn: {product.stockQuantity}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-orange-500 font-bold text-sm">
                {formatPrice(product.finalPrice)}
              </div>
              {hasDiscount && (
                <div className="text-gray-500 line-through text-xs">
                  {formatPrice(product.basePrice)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProductsGrid;
