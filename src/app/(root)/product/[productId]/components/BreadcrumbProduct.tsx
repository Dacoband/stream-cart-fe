"use client";
import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { ProductDetail } from "@/types/product/product";

// import { getCategoryById } from "@/services/api/categories/categorys";

interface BreadcrumbProductProps {
  product: ProductDetail;
}

export default function BreadcrumbProduct({ product }: BreadcrumbProductProps) {
  // const [categoryName, setCategoryName] = useState<string>("");

  // useEffect(() => {
  //   const fetchCategory = async () => {
  //     try {
  //       const category = await getCategoryById(product.category);
  //       setCategoryName(category?.categoryName || "Danh mục");
  //     } catch (error) {
  //       console.error("Lỗi khi lấy danh mục:", error);
  //       setCategoryName("Danh mục");
  //     }
  //   };

  //   fetchCategory();
  // }, [product.categoryId]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="font-medium text-base cursor-pointer">
          <BreadcrumbLink asChild>
            <Link href="/home">Trang chủ</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="font-medium text-base cursor-pointer">
          <BreadcrumbLink asChild>
            <Link href="/components">{product.categoryName}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-base">
            {product.productName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
