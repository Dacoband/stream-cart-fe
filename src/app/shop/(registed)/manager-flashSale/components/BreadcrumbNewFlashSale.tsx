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

export default function BreadcrumbNewFlashSale() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="font-medium text-lg cursor-pointer">
          <BreadcrumbLink asChild>
            <Link href="/shop/manager-flashSale">Flash Sale</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-lg">
            Tạo Flash Sale
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
