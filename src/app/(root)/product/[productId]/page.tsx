"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BreadcrumbProduct from "./components/BreadcrumbProduct";
import DescriptionProduct from "./components/DescriptionProduct";
import InforShop from "./components/InforShop";
import OperationProduct from "./components/OperationProduct";
import { getProductDetailById } from "@/services/api/product/product";
import { ProductDetail } from "@/types/product/product";
import NotFound from "@/components/common/NotFound";
import LoadingScreen from "@/components/common/LoadingScreen";
export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductDetailById(productId);
        setProduct(res);
      } catch (err) {
        console.error("Lỗi khi gọi API sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading)
    return (
      <div>
        <LoadingScreen />
      </div>
    );
  if (!product)
    return (
      <div className="flex justify-center w-full items-center flex-col pt-10">
        <NotFound />
        <h2 className="font-semibold text-2xl">
          Rất tiếc! Sản phẩm này không tồn tại hoặc bị xóa.
        </h2>
      </div>
    );

  return (
    <div className="flex flex-col w-[70%] mx-auto mt-2 mb-20">
      <div className="my-2.5">
        <BreadcrumbProduct product={product} />
      </div>
      <div className="flex flex-col gap-5 w-full">
        <div className="bg-white py-8 rounded-sm w-full mx-auto shadow">
          <OperationProduct product={product} />
        </div>
        <div className="bg-white py-5 rounded-sm w-full mx-auto shadow">
          <InforShop product={product} />
        </div>
        <div className="bg-white py-8 rounded-sm w-full mx-auto shadow">
          <DescriptionProduct product={product} />
        </div>
      </div>
    </div>
  );
}
