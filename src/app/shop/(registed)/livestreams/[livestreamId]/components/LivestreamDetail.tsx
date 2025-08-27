"use client";
import { useEffect, useState, useCallback } from "react";
import { getLivestreamByIdFromAPI, getLivestreamProducts, getBestSellingProducts } from "@/services/api/livestream/livestream";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Users, Play, Loader2, Crown, TrendingUp, ShoppingBag, Star, Award } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface LivestreamData {
  id: string;
  title: string;
  description: string;
  sellerId: string;
  sellerName: string;
  shopId: string;
  shopName: string;
  livestreamHostId: string;
  livestreamHostName: string;
  scheduledStartTime: string;
  actualStartTime: string;
  actualEndTime: string;
  status: boolean;
  streamKey: string;
  playbackUrl: string;
  livekitRoomId: string;
  joinToken: string;
  thumbnailUrl: string;
  maxViewer: number;
  approvalStatusContent: boolean;
  approvedByUserId: string | null;
  approvalDateContent: string | null;
  isPromoted: boolean;
  tags: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
  }>;
}

interface LivestreamProduct {
  id: string;
  livestreamId: string;
  productId: string;
  variantId: string;
  isPin: boolean;
  originalPrice: number;
  price: number;
  stock: number;
  productStock: number;
  createdAt: string;
  lastModifiedAt: string;
  sku: string;
  productName: string;
  productImageUrl: string;
  variantName: string;
}

interface LivestreamDetailProps {
  livestreamId: string;
}

export default function LivestreamDetail({
  livestreamId,
}: LivestreamDetailProps) {
  const [livestream, setLivestream] = useState<LivestreamData | null>(null);
  const [products, setProducts] = useState<LivestreamProduct[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<LivestreamProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [bestSellingLoading, setBestSellingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLivestream = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getLivestreamByIdFromAPI(livestreamId);
      setLivestream(data);
    } catch (e) {
      console.error("Load livestream detail error", e);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [livestreamId]);

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const data = await getLivestreamProducts(livestreamId);
      setProducts(data || []);
    } catch (e) {
      console.error("Load livestream products error", e);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [livestreamId]);

  const fetchBestSellingProducts = useCallback(async () => {
    try {
      setBestSellingLoading(true);
      const data = await getBestSellingProducts(livestreamId, 4);
      setBestSellingProducts(data || []);
    } catch (e) {
      console.error("Load best selling products error", e);
      setBestSellingProducts([]);
    } finally {
      setBestSellingLoading(false);
    }
  }, [livestreamId]);

  useEffect(() => {
    fetchLivestream();
    fetchProducts();
    fetchBestSellingProducts();
  }, [fetchLivestream, fetchProducts, fetchBestSellingProducts]);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Chưa xác định";
    return format(new Date(dateString), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-red-500 hover:bg-red-600 text-white">
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
        Đang Live
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-500 text-white">
        Đã kết thúc
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !livestream) {
    return (
      <div className="p-8">
        <Card className="bg-gray-50 py-8 px-8 min-h-[50vh] flex flex-col items-center justify-center shadow-lg">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Có lỗi xảy ra</h3>
          <p className="text-red-500 mb-6 text-center">
            {error || "Không tìm thấy livestream."}
          </p>
          <Link href="/shop/livestreams">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg">
              <ArrowRight className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-screen bg-gray-50">
      {/* Header compact hơn */}
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow-md border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{livestream.title}</h2>
            <div className="flex items-center space-x-4">
              <p className="text-gray-600">{livestream.shopName}</p>
              {getStatusBadge(livestream.status)}
            </div>
          </div>
          <Link href="/shop/livestreams">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
              <ArrowRight size={20} className="mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-4 mb-4 flex-1">
        <Card className="bg-white py-6 px-6 h-full shadow-lg rounded-xl">
          {/* Tabs compact */}
          <Tabs defaultValue="description" className="w-full h-full flex flex-col">
            <TabsList className="mb-4 bg-gray-100 p-2 rounded-lg flex-shrink-0">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white py-2 px-6 rounded-md cursor-pointer font-semibold"
              >
                <Eye className="w-4 h-4 mr-2" />
                Thông tin LiveStream
              </TabsTrigger>
              <TabsTrigger
                value="product"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white py-2 px-6 rounded-md cursor-pointer font-semibold"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Sản phẩm trong Live ({products.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-0 flex-1 overflow-hidden">
              <div className="grid grid-cols-12 gap-6 h-full">
                {/* Video Section - 7 columns */}
                <div className="col-span-7 flex flex-col">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg flex-shrink-0">
                    {livestream.thumbnailUrl ? (
                      <Image
                        src={livestream.thumbnailUrl}
                        alt={livestream.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white">
                          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Không có video preview</p>
                        </div>
                      </div>
                    )}
                    {livestream.status && (
                      <div className="absolute top-4 left-4">
                        <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                          <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                          LIVE
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Button size="lg" className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/50">
                        <Play className="w-8 h-8 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Info Panel - 5 columns */}
                <div className="col-span-5 grid grid-rows-2 gap-6 h-full">
                  {/* Thông tin Live - Row 1 (tăng kích thước) */}
                  <Card className="p-6 bg-gray-50 shadow-md rounded-lg">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                      <Users className="w-6 h-6 mr-3 text-blue-500" />
                      Thông tin Live
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-base font-semibold text-gray-600 block mb-2">Tên livestream</label>
                        <p className="text-gray-800 font-medium text-lg leading-relaxed">{livestream.title}</p>
                      </div>
                      
                      <div>
                        <label className="text-base font-semibold text-gray-600 block mb-2">Mô tả</label>
                        <p className="text-gray-700 text-base leading-relaxed">
                          {livestream.description || "Không có mô tả"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                          <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold text-gray-800">{livestream.maxViewer}</div>
                          <div className="text-sm text-gray-500">Lượt xem</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                          <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold text-gray-800">{products.length}</div>
                          <div className="text-sm text-gray-500">Sản phẩm</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Host Info & Time - Row 2 */}
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="p-6 bg-gray-50 shadow-md rounded-lg">
                      <h4 className="font-bold mb-4 text-lg text-gray-800">
                        <Users className="w-5 h-5 inline mr-2" />
                        Thông tin Host
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 text-base font-medium">Host:</span>
                          <p className="font-semibold text-lg text-gray-800">{livestream.livestreamHostName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 text-base font-medium">Shop:</span>
                          <p className="font-semibold text-lg text-gray-800">{livestream.shopName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 text-base font-medium">Seller:</span>
                          <p className="font-semibold text-lg text-gray-800">{livestream.sellerName}</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 bg-gray-50 shadow-md rounded-lg">
                      <h4 className="font-bold mb-4 text-lg text-gray-800">
                        Thời gian
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-gray-600 text-base font-medium">Dự kiến:</div>
                          <div className="font-semibold text-base">{formatDateTime(livestream.scheduledStartTime)}</div>
                        </div>
                        {livestream.actualStartTime && (
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-gray-600 text-base font-medium">Bắt đầu:</div>
                            <div className="font-semibold text-base">{formatDateTime(livestream.actualStartTime)}</div>
                          </div>
                        )}
                        {livestream.actualEndTime && (
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-gray-600 text-base font-medium">Kết thúc:</div>
                            <div className="font-semibold text-base">{formatDateTime(livestream.actualEndTime)}</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Tags nhỏ ở cuối */}
                      {livestream.tags && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex flex-wrap gap-1">
                            {livestream.tags.split(',').slice(0, 3).map((tag, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
                                #{tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="product" className="mt-0">
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
                          <Card key={product.id} className="bg-white p-4 shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200">
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
                          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white shadow-md rounded-lg">
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
                              <div className="absolute top-3 right-3">
                                <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                                  {product.stock}/{product.productStock}
                                </div>
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
                                  {product.originalPrice > product.price && (
                                    <span className="text-sm text-gray-400 line-through">
                                      {formatPrice(product.originalPrice)}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex justify-between items-center text-xs">
                                  <Badge variant="outline" className="text-gray-600">
                                    SKU: {product.sku}
                                  </Badge>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    product.stock > 0 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
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
                        <h4 className="font-bold text-gray-700 mb-3 text-lg">Chưa có sản phẩm</h4>
                        <p className="text-gray-500">Livestream này chưa có sản phẩm nào được thêm vào.</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
}
