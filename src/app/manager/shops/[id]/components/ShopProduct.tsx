'use client'

import * as React from 'react'
import { MoreHorizontal, Star, ChevronDown, Search, Eye } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
type Product = {
  id: string
  name: string
  image: string // Thêm trường hình ảnh
  category: string
  status: 'Đang bán' | 'Hết hàng'
  stock: number
  price: number
  sold: number
  soldTrend: 'up' | 'down' | 'none'
  rating: number
  revenue: number
  revenueColor: string
  ratingColor: string
  statusColor: string
  ratingCount: number
  unit: string
  categorySub: string
}

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN')
}

export const ShopProductList = ({ products }: { products: any[] }) => {
  return (
    <Card className=" p-6 ">
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="text-gray-600" />
            </span>
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="max-w-full pl-12"
            />
          </div>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[160px] justify-between cursor-pointer"
              >
                Tất cả danh mục
                <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* DropdownMenuContent cho danh mục sản phẩm */}
          </DropdownMenu>
        </div>
      </div>
      <div className="w-full ">
        <Table className="border-t border-gray-200">
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow className=" rounded-t-lg border-none">
              <TableHead className="w-[400px] text-base py-4 font-medium ">
                Sản phẩm
              </TableHead>
              <TableHead className="text-center text-base  font-medium">
                Ngành hàng
              </TableHead>
              <TableHead className="text-center text-base  font-medium">
                Giá
              </TableHead>
              <TableHead className="text-center text-base  font-medium">
                Kho
              </TableHead>
              <TableHead className="text-center text-base  font-medium">
                Trạng thái
              </TableHead>
              <TableHead className="text-center text-base  font-medium">
                Đã bán
              </TableHead>
              <TableHead className="text-center text-base  font-medium">
                Đánh giá
              </TableHead>
              <TableHead className="text-center  text-base  font-medium">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <TableCell>
                  <div className="flex  gap-3 py-2">
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={70}
                      height={70}
                      className="object-cover rounded w-[70px] h-[70px] border-1"
                    />

                    <div className="flex flex-col justify-start ">
                      <div className="font-medium text-base line-clamp-2 ">
                        {p.name}
                      </div>
                      <div className="text-sm mt-2 text-black/70">
                        SKU sản phẩm: ABC
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${p.statusColor}`}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {formatCurrency(p.price)} <span className="text-xs">đ</span>
                </TableCell>{' '}
                <TableCell className="text-center font-semibold">
                  {p.stock}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${p.statusColor}`}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {p.sold}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  <div className="inline-flex justify-center items-center gap-1 w-full">
                    {p.rating}
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="w-4 h-4" />
                    Xem
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
