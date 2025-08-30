"use client";

import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Plus } from "lucide-react";
import { getFlashSalesForShop } from "@/services/api/product/flashSale";
import { FlashSaleProductHome, SLOT_TIMES } from "@/types/product/flashSale";
import Image from "next/image";
import { FormatDate } from "@/components/common/FormatDate";

export default function TableFlashSale() {
  const [products, setProducts] = React.useState<FlashSaleProductHome[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const statusFromRow = (r: FlashSaleProductHome) => {
    if (r.isActive) return "Đang hoạt động";
    const now = Date.now();
    const start = new Date(r.startTime).getTime();
    return now < start ? "Sắp diễn ra" : "Đã kết thúc";
  };

  useEffect(() => {
    const fetchFlashSales = async () => {
      setLoading(true);
      try {
        const res = await getFlashSalesForShop({});
        setProducts(res.data || []);
      } catch (e) {
        console.error("Fetch flash sale products failed", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSales();
  }, []);

  return (
    <Card className="bg-white py-5 px-8 min-h-[40vh]">
      <div className="w-full">
        <Table>
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="font-semibold pl-6">Khung giờ</TableHead>
              <TableHead className="font-semibold">Sản phẩm</TableHead>
              <TableHead className="font-semibold">Số lượng</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold text-right w-24 pr-6">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center">
                  Đang tải danh sách…
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Không có sản phẩm Flash Sale
                </TableCell>
              </TableRow>
            ) : (
              products.map((r) => (
                <TableRow key={`${r.id}`}>
                  <TableCell className="pl-6 align-top w-[20%]">
                    <div className="flex gap-8">
                      <div className="font-medium">
                        <FormatDate date={r.startTime} />
                      </div>
                      <div className="font-medium">
                        {SLOT_TIMES[r.slot]?.start} - {SLOT_TIMES[r.slot]?.end}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded overflow-hidden bg-gray-50">
                        <Image
                          src={r.productImageUrl || "/assets/emptyData.png"}
                          alt={r.productName}
                          fill
                          sizes="52px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium line-clamp-1">
                          {r.productName}
                        </span>
                        {r.variantName && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {r.variantName}
                          </span>
                        )}
                        <span className="text-sm text-rose-600">
                          {r.flashSalePrice.toLocaleString()}₫
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-2 mr-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">
                          {r.quantitySold}/{r.quantityAvailable}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(
                            (r.quantitySold / r.quantityAvailable) *
                            100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (r.quantitySold / r.quantityAvailable) * 100 >= 80
                              ? "bg-red-500"
                              : (r.quantitySold / r.quantityAvailable) * 100 >=
                                50
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${(
                              (r.quantitySold / r.quantityAvailable) *
                              100
                            ).toFixed(0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    {statusFromRow(r)}
                  </TableCell>
                  <TableCell className="align-top text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                        >
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-blue-600">
                          <Edit className="mr-2" size={16} /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-blue-600">
                          <Plus className="mr-2" size={16} /> Thêm
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
