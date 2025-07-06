'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Star,
  Search,
} from 'lucide-react'
import { Shop } from '@/types/shop/shop'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

type Props = {
  shops: Shop[]
  loading: boolean
}

const TableShops: React.FC<Props> = ({ shops, loading }) => {
  const router = useRouter()
  return (
    <Card className="bg-white py-5 px-8 overflow-x-auto">
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="text-gray-600" />
            </span>
            <Input
              placeholder="Tìm kiếm tên cửa hàng..."
              className="max-w-full pl-12"
              // value={searchValue}
              // onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>
        <div>
          {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[160px] justify-between cursor-pointer"
          >
            {statusFilter === null
              ? 'Tất cả danh mục'
              : statusFilter === false
              ? 'Đang hoạt động'
              : 'Đã xóa'}
            <ChevronDown className="ml-2 w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setStatusFilter(null)}>
            Tất cả danh mục
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter(false)}>
            Đang hoạt động
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStatusFilter(true)}>
            Đã xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
        </div>
      </div>
      <div className="w-full">
        <div className="min-w-[1000px] w-full">
          <Table className="w-full table-auto border-t border-gray-200">
            <TableHeader className="bg-[#B0F847]/50">
              <TableRow>
                <TableHead className="w-[20%] text-base py-4 px-5">
                  Tên cửa hàng
                </TableHead>
                <TableHead className="text-center text-base px-5">
                  Đánh giá
                </TableHead>
                <TableHead className="text-center text-base px-5">
                  Trạng thái duyệt
                </TableHead>
                <TableHead className="text-center text-base px-5">
                  Trạng thái
                </TableHead>
                <TableHead className="text-center text-base px-5">
                  Tỉ lệ hoàn thành
                </TableHead>
                <TableHead className="text-center text-base px-5">
                  Gói thành viên
                </TableHead>
                <TableHead className="text-center text-base px-5 w-[1%] whitespace-nowrap">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-gray-500"
                  >
                    Không có shop nào
                  </TableCell>
                </TableRow>
              ) : (
                shops.map((shop) => (
                  <TableRow
                    key={shop.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/shops/${shop.id}`)}
                  >
                    <TableCell className="flex items-center gap-3 px-5 py-4">
                      <Image
                        src={shop.logoURL}
                        alt={shop.shopname}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <span className="text-base font-medium">
                        {shop.shopname}
                      </span>
                    </TableCell>

                    <TableCell className="text-center align-middle px-5">
                      <span className="flex justify-center items-center gap-1">
                        <span className="font-medium">
                          {shop.ratingAverage.toFixed(1)}
                        </span>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < Math.round(shop.ratingAverage)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }
                            size={16}
                          />
                        ))}
                      </span>
                    </TableCell>

                    <TableCell className="text-center align-middle px-5">
                      {shop.approvalStatus === 'approved' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                          Đã duyệt
                        </span>
                      ) : shop.approvalStatus === 'pending' ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-600">
                          Chờ duyệt
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          Từ chối
                        </span>
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
                      {shop.completeRate}%
                    </TableCell>

                    <TableCell className="text-center align-middle px-5">
                      {(shop as Shop & { memberPackage?: string })
                        .memberPackage || 'Cơ bản'}
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
                              router.push(`/admin/shops/${shop.id}`)
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  )
}

export default TableShops
