"use client";
import { useEffect, useState, useCallback } from "react";
import {
  getLivestreamByIdFromAPI,
  getLivestreamProducts,
  getBestSellingProducts,
} from "@/services/api/livestream/livestream";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Livestream, LivestreamProduct } from "@/types/livestream/livestream";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import TabDescripLive from "./TabDescripLive";
import TabProducts from "./TabProducts";
interface LivestreamDetailProps {
  livestreamId: string;
}

export default function LivestreamDetail({
  livestreamId,
}: LivestreamDetailProps) {
  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [products, setProducts] = useState<LivestreamProduct[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<
    LivestreamProduct[]
  >([]);
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

  const getStatusBadge = (status: boolean, actualEndTime?: string | null) => {
    if (status) {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          Đang Live
        </Badge>
      );
    }
    if (actualEndTime) {
      return (
        <Badge variant="secondary" className="bg-blue-500 text-white">
          Đã kết thúc
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-[#B0F847] text-black">
        Chưa phát
      </Badge>
    );
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
      <div className="p-8 ">
        <Card className="bg-gray-50 py-8 px-8 min-h-[50vh] flex flex-col items-center justify-center shadow-lg">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Có lỗi xảy ra
          </h3>
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
    <div className="flex flex-col gap-4 min-h-[92vh] bg-gray-50">
      {/* Header compact hơn */}
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow-md border-b">
        <div className="flex justify-between items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="font-medium text-lg cursor-pointer">
                <BreadcrumbLink asChild>
                  <Link href="/shop/livestreams">Livestream</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-lg">
                  Live {livestream.title}{" "}
                  {getStatusBadge(
                    livestream.status,
                    livestream.actualEndTime
                      ? typeof livestream.actualEndTime === "string"
                        ? livestream.actualEndTime
                        : livestream.actualEndTime.toISOString()
                      : null
                  )}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-10 my-5 flex-1">
        <Card className="bg-white py-6 px-6 h-full shadow-lg rounded-xl">
          <Tabs
            defaultValue="description"
            className="w-full h-full flex flex-col"
          >
            <TabsList className="mb-4 bg-gray-100  rounded-none flex-shrink-0">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-[#B0F847] p-2  data-[state=active]:text-black  rounded-none cursor-pointer font-semibold"
              >
                <Eye className="w-4 h-4 mr-2" />
                Thông tin LiveStream
              </TabsTrigger>
              <TabsTrigger
                value="product"
                className="data-[state=active]:bg-[#B0F847] p-2 data-[state=active]:text-black  rounded-none cursor-pointer font-semibold"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Sản phẩm trong Live ({products.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="description"
              className="mt-0 flex-1 overflow-hidden"
            >
              {livestream && (
                <TabDescripLive
                  livestream={livestream}
                  onReload={fetchLivestream}
                  products={products}
                />
              )}
            </TabsContent>

            <TabsContent value="product" className="mt-0">
              <TabProducts
                products={products}
                productsLoading={productsLoading}
                bestSellingProducts={livestream?.status ? bestSellingProducts : []}
                bestSellingLoading={livestream?.status ? bestSellingLoading : false}
              />
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
