'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { ChevronDown, Search, Eye } from 'lucide-react'
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
import { Product } from '@/types/product/product'

function formatCurrency(n: number) {
  return n.toLocaleString('vi-VN')
}

export const ShopProductList = ({ products }: { products: Product[] }) => {
  const [clientRendered, setClientRendered] = useState(false)

  useEffect(() => {
    setClientRendered(true)
  }, [])

  return (
    <Card className="p-6">
      {/* Header: Search + Filter */}
      <div className="flex items-center gap-3 pb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10 w-full"
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[160px] justify-between">
              Tất cả danh mục
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Danh mục</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Danh mục 1</DropdownMenuItem>
            <DropdownMenuItem>Danh mục 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="border-t border-gray-200 min-w-[1000px]">
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="w-[400px] py-3 px-3 text-base font-medium">
                Sản phẩm
              </TableHead>
              <TableHead className="text-center text-base font-medium">
                SKU
              </TableHead>
              <TableHead className="text-center text-base font-medium">
                Giá
              </TableHead>
              <TableHead className="text-center text-base font-medium">
                Kho
              </TableHead>
              <TableHead className="text-center text-base font-medium">
                Trạng thái
              </TableHead>
              <TableHead className="text-center text-base font-medium">
                Đã bán
              </TableHead>
              <TableHead className="text-center text-base font-medium">
                Ngày tạo
              </TableHead>
              <TableHead className="text-center text-base font-medium">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-gray-500">Chưa có sản phẩm nào</div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="py-3 align-top">
                    <div className="flex items-start gap-3">
                      <Image
                        src={product.primaryImageUrl || '/assets/nodata.png'}
                        alt={product.productName}
                        width={70}
                        height={70}
                        className="object-cover rounded border w-[70px] h-[70px] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm break-words line-clamp-2">
                          {product.productName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <span className="text-sm font-medium">{product.sku}</span>
                  </TableCell>
                  <TableCell className="text-center align-middle font-semibold">
                    {formatCurrency(product.finalPrice)}{' '}
                    <span className="text-xs">đ</span>
                  </TableCell>
                  <TableCell className="text-center align-middle font-semibold">
                    {product.stockQuantity}
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center align-middle font-semibold">
                    {product.quantitySold}
                  </TableCell>
                  <TableCell className="text-center align-middle text-sm">
                    {clientRendered
                      ? new Date(product.createdAt).toLocaleDateString('vi-VN')
                      : ''}
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="w-4 h-4" />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
