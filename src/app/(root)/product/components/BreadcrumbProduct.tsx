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
function BreadcrumbProduct() {
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
            Gấu bông Bonnie lông mềm Quãng Châu
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbProduct;
