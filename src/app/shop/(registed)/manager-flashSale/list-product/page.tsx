"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getFlashSalesForShop } from "@/services/api/product/flashSale";
import { FlashSaleProductHome, SLOT_TIMES } from "@/types/product/flashSale";
import { Card, CardTitle } from "@/components/ui/card";
import { FormatDate } from "@/components/common/FormatDate";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Calendar, Clock, Edit, Trash } from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import PriceTag from "@/components/common/PriceTag";

export default function ProductFlashSalePage() {
  const searchParams = useSearchParams();
  const dateStr = searchParams.get("date");
  const slot = searchParams.get("slot");
  const [loading, setLoading] = React.useState<boolean>(true);

  const [products, setProducts] = useState<FlashSaleProductHome[]>([]);
  const slotNumber = slot ? Number(slot) : undefined;
  const date = React.useMemo(
    () => (dateStr ? new Date(dateStr) : undefined),
    [dateStr]
  );
  const slotTime =
    slotNumber !== undefined && !isNaN(slotNumber) && SLOT_TIMES[slotNumber]
      ? `${SLOT_TIMES[slotNumber].start} - ${SLOT_TIMES[slotNumber].end}`
      : "";

  useEffect(() => {
    const fetchFlashSalesProducts = async () => {
      setLoading(true);
      try {
        const res = await getFlashSalesForShop({
          StartDate: date,
          Slot: slotNumber,
        });
        setProducts(res || []);
      } catch (e) {
        console.error("Fetch flash sale products failed", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSalesProducts();
  }, [date, slotNumber]);
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="font-medium text-lg cursor-pointer">
              <BreadcrumbLink asChild>
                <Link href="/shop/manager-flashSale">Flash Sale</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-lg flex items-center gap-6">
                <span className="flex gap-2 items-center">
                  <Calendar className="h-5 w-5" />
                  <FormatDate date={date ?? ""} />
                </span>
                <span className="flex gap-2 items-center">
                  <Clock className="h-5 w-5" />
                  {slotTime && <span>{slotTime}</span>}
                </span>{" "}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="w-[90%] mx-auto mt-5 mb-10">
        <Card className="bg-white p-8 rounded-xl shadow-sm">
          <CardTitle className="text-xl font-medium">
            Danh sách sản phẩm
          </CardTitle>
          <Table>
            <TableHeader className="bg-[#B0F847]/50">
              <TableRow>
                <TableHead className="font-semibold pl-6 w-1/2">
                  Sản phẩm
                </TableHead>
                <TableHead className="font-semibold w-1/4">
                  Số lượng trong Flash Sale
                </TableHead>
                <TableHead className="font-semibold w-1/4">Giá sale</TableHead>
                <TableHead className="font-semibold text-right w-1/4 pr-6">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>

                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div>
                      <Image
                        src="/assets/emptydata.png"
                        alt="No data"
                        width={180}
                        height={200}
                        className="mt-14 mx-auto"
                      />
                      <div className="text-center mt-4 text-xl text-lime-700/60  font-medium">
                        Hiện chưa có LiveStream nào
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} className="">
                    <TableCell>
                      <div className="flex gap-2">
                        <div className="w-[65px] h-[65px] relative flex-shrink-0">
                          <Image
                            src={p.productImageUrl || "/assets/emptydata.png"}
                            alt={p.productName}
                            fill
                            className="rounded object-cover"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-base text-gray-900 line-clamp-2 break-words whitespace-normal max-w-[305px]">
                            {p.productName}
                          </p>
                          <p className="text-gray-700">{p.variantName}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="pr-5">
                      <div className="space-y-2 mr-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">
                            {p.quantitySold}/{p.quantityAvailable}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(
                              (p.quantitySold / p.quantityAvailable) *
                              100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (p.quantitySold / p.quantityAvailable) * 100 >= 80
                                ? "bg-red-500"
                                : (p.quantitySold / p.quantityAvailable) *
                                    100 >=
                                  50
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${(
                                (p.quantitySold / p.quantityAvailable) *
                                100
                              ).toFixed(0)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[300px]">
                      <div className="font-medium text-base text-rose-600">
                        <PriceTag value={p.flashSalePrice} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-5">
                        <Edit />
                        <Trash />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
