'use client'
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
import { ChevronDown, Search, MoreHorizontal, CirclePlus } from 'lucide-react'
import Image from 'next/image'

import React, { useEffect, useState } from 'react'
import { Category } from '@/types/category/category'
type Props = {
  categories: Category[]
  loading: boolean
  page: number
  setPage: (p: number) => void
  totalPages: number
  onSearch: (val: string) => void
  // statusFilter: boolean | null
  // setStatusFilter: (val: boolean | null) => void
}
const TableCatgories: React.FC<Props> = ({
  categories,
  loading,
  page,
  setPage,
  totalPages,
  onSearch,
  // statusFilter,
  // setStatusFilter,
}) => {
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(searchValue)
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchValue])

  return (
    <Card className="bg-white py-5 px-8">
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="text-gray-600" />
            </span>
            <Input
              placeholder="Tìm kiếm tên danh mục..."
              className="max-w-full pl-12"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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
      <div className="w-full ">
        <Table className="border-t border-gray-200">
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow className=" rounded-t-lg border-none">
              <TableHead className="w-[65%] text-base py-4 font-medium px-5">
                Tên danh mục
              </TableHead>
              <TableHead className="text-center text-base  font-medium px-5">
                Icon
              </TableHead>
              <TableHead className="text-center text-base  font-medium px-5">
                Trạng thái
              </TableHead>
              <TableHead className="text-center text-base  font-medium w-[1%] whitespace-nowrap px-5">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
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
                      Không có danh mục nào
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.categoryId}>
                  <TableCell className="text-base py-4 align-middle px-5 ">
                    {c.categoryName}
                  </TableCell>
                  <TableCell className="text-center align-middle px-5">
                    <div className="flex items-center justify-center">
                      <Image
                        src={c.iconURL}
                        alt={c.categoryName}
                        width={60}
                        height={60}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center align-middle px-5">
                    {1 === 1 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 ">
                        Đã xóa
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600 ">
                        Đang hoạt động
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center align-middle w-[1%] whitespace-nowrap px-5">
                    <div className="flex items-center justify-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                          <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {1 === 1 ? (
                            <DropdownMenuItem className="text-red-500">
                              Khôi phục
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-red-500">
                              Xóa
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

export default TableCatgories
