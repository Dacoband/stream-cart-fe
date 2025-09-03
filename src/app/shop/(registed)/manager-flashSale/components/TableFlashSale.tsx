"use client";

import React from "react";
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, Edit, Plus } from "lucide-react";
import Image from "next/image";
import { getProductDetailById } from "@/services/api/product/product";
import type { ProductDetail } from "@/types/product/product";
import { Skeleton } from "@/components/ui/skeleton";
type FSStatus = "upcoming" | "running" | "ended";

type FlashSaleRow = {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  title: string;
  productCount: number;
  remindCount?: number | null;
  clicksViews?: number | null;
  status: FSStatus;
  enabled: boolean;
};

function fmt2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatSlot(start: string | Date, end: string | Date) {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "—";
  const sHH = fmt2(s.getHours());
  const sMM = fmt2(s.getMinutes());
  const d = fmt2(s.getDate());
  const m = fmt2(s.getMonth() + 1);
  const y = s.getFullYear();
  const eHH = fmt2(e.getHours());
  const eMM = fmt2(e.getMinutes());
  return `${sHH}:${sMM} ${d}-${m}-${y} - ${eHH}:${eMM}`;
}

const statusText = (st: FSStatus) => {
  switch (st) {
    case "upcoming":
      return <span className="text-gray-500">Đã kết thúc</span>;
    case "running":
      return <span className="text-green-600">Đang diễn ra</span>;
    default:
      return <span className="text-gray-500">Đã kết thúc</span>;
  }
};

const mockRows: FlashSaleRow[] = [
  {
    id: "fs-001",
    startTime: "2025-08-23T21:00:00",
    endTime: "2025-08-24T00:00:00",
    title: "Bật Flash Sale 9",
    productCount: 1,
    remindCount: null,
    clicksViews: null,
    status: "upcoming",
    enabled: true,
  },
  {
    id: "fs-002",
    startTime: "2025-08-23T17:00:00",
    endTime: "2025-08-23T19:00:00",
    title: "Bật Flash Sale 10",
    productCount: 0,
    remindCount: null,
    clicksViews: null,
    status: "upcoming",
    enabled: true,
  },
];

export default function TableFlashSale() {
  const [rows] = React.useState<FlashSaleRow[]>(mockRows);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [product, setProduct] = React.useState<ProductDetail | null>(null);
  const [loadingProduct, setLoadingProduct] = React.useState<boolean>(true);

  const formatVND = (n?: number) =>
    typeof n === "number"
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(n)
      : "—";

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoadingProduct(true);
      try {
        const res = await getProductDetailById(
          "8133b3e7-d851-4066-9bae-1747c6a1ad17"
        );
        if (mounted) setProduct(res ?? null);
      } catch (e) {
        console.error("Fetch product detail failed", e);
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoadingProduct(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase().trim();
    return rows.filter((r) =>
      formatSlot(r.startTime, r.endTime).toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  return (
    <Card className="bg-white py-5 px-8 min-h-[40vh]">
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="text-gray-600" />
            </span>
            <Input
              placeholder="Tìm theo khung giờ (vd: 21:00 23-08-2025)"
              className="max-w-full pl-12 pr-10 py-5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        <Table>
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="font-semibold pl-6">Khung giờ</TableHead>
              <TableHead className="font-semibold">Mô tả</TableHead>
              <TableHead className="font-semibold">Sản phẩm</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold text-right w-24 pr-6">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Không có Flash Sale phù hợp
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6 align-top">
                    <div className="whitespace-pre-line leading-6">
                      {formatSlot(r.startTime, r.endTime)}
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col">
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {r.title}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Số sản phẩm tham gia {r.productCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    {loadingProduct ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    ) : product ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-50">
                          <Image
                            src={
                              product.primaryImage?.[0] ||
                              "/assets/emptyData.png"
                            }
                            alt={product.productName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium line-clamp-1">
                            {product.productName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatVND(product.finalPrice)} • SL:{" "}
                            {product.stockQuantity}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Không tải được sản phẩm
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {statusText(r.status)}
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
