"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Star,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Shop } from "@/types/shop/shop";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type Props = {
  shops: Shop[];
  loading: boolean;
  onSearch: (value: string) => void;
  onStatusFilter: (status: string) => void;
  onApprovalStatusFilter: (status: string) => void;
  onRefresh: () => void;
  pageNumber: number;
  setPageNumber: (page: number) => void;
  totalPages: number;
  totalCount: number;
};

const TableShops: React.FC<Props> = ({
  shops,
  loading,
  onSearch,
  onStatusFilter,
  // onApprovalStatusFilter,
  // onRefresh,
  pageNumber,
  setPageNumber,
  totalPages,
  totalCount,
}) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(searchValue);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchValue, onSearch]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  return (
    <Card className="bg-white py-5 px-8 overflow-x-auto">
      {/* Tìm kiếm & lọc */}
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="text-gray-600" />
            </span>
            <Input
              placeholder="Tìm kiếm tên cửa hàng..."
              className="max-w-full pl-12"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[160px] justify-between cursor-pointer"
              >
                Trạng thái
                <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onStatusFilter("")}>
                Tất cả
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilter("active")}>
                Đang hoạt động
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusFilter("inactive")}>
                Dừng hoạt động
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="min-w-[900px] w-full">
        <Table className="w-full table-auto border-t border-gray-200">
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="w-[30%] text-base py-4 px-5">
                Tên cửa hàng
              </TableHead>
              <TableHead className="text-center text-base px-5 w-[20%]">
                Đánh giá
              </TableHead>
              <TableHead className="text-center text-base px-5 w-[20%]">
                Trạng thái
              </TableHead>
              <TableHead className="text-center text-base px-5 w-[20%]">
                Tỉ lệ hoàn thành
              </TableHead>
              <TableHead className="text-center text-base px-5 w-[10%]">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    <span className="ml-2">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (shops || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="flex flex-col items-center justify-center py-10">
                    <Image
                      src="/assets/nodata.png"
                      alt="No data"
                      width={300}
                      height={200}
                      className="mb-4"
                    />
                    <p className="text-gray-500 text-base">
                      Không có cửa hàng nào
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              shops.map((shop) => {
                if (!shop || !shop.id) return null;

                const shopName = shop.shopName || "Không có tên";

                const rating = shop.ratingAverage || 0;

                return (
                  <TableRow
                    key={shop.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/manager/shops/${shop.id}`)}
                  >
                    <TableCell className="px-5 py-4 text-base font-medium">
                      {shopName}
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      {rating === 0 ? (
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex justify-center items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={`empty-star-${shop.id}-${i}`}
                                className="text-gray-300"
                                size={16}
                              />
                            ))}
                          </div>
                          <span className="text-gray-500 text-sm italic mb-1">
                            Chưa có đánh giá
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center gap-1">
                          <span className="font-medium">
                            {rating.toFixed(1)}
                          </span>
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={`star-${shop.id}-${i}`}
                              className={
                                i < Math.round(rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }
                              size={16}
                            />
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      {shop.status ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          Dừng hoạt động
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      {shop.completeRate || 0}%
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/manager/shops/${shop.id}`)
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            Phê duyệt
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <XCircle className="w-4 h-4 mr-2 text-red-500" />
                            Từ chối
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Hiển thị {(pageNumber - 1) * 10 + 1} -{" "}
            {Math.min(pageNumber * 10, totalCount)} trong tổng số {totalCount}{" "}
            cửa hàng
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Trang {pageNumber} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TableShops;
