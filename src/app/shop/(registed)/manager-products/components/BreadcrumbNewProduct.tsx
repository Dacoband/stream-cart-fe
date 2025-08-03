"use client";
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

export default function BreadcrumbNewProduct() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="font-medium text-lg cursor-pointer">
          <BreadcrumbLink asChild>
            <Link href="/shop/manager-products">Sản phẩm</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-lg">
            Thêm 1 sản phẩm
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
