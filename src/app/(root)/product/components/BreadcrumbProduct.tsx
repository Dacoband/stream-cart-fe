import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Product } from "@/types/product/product";
interface BreadcrumbProductPops {
  product: Product;
}
function BreadcrumbProduct({ product }: BreadcrumbProductPops) {
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
            <Link href="/components">Đồ chơi</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-base  ">
            {product.productName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbProduct;
