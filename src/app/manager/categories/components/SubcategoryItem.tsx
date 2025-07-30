'use client'

import React, { useState } from 'react'
import { Category } from '@/types/category/category'
import { Button } from '@/components/ui/button'
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
import { ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'

interface SubcategoryItemProps {
  subCategory: Category
  onDeleteCategory: (
    categoryId: string,
    categoryName: string,
    isDeleted: boolean
  ) => void
  onViewDetail: (categoryId: string) => void
  onAddSubcategory: (parentCategory: Category) => void
  onUpdateCategory: (category: Category) => void
  level?: number
}

const SubcategoryItem: React.FC<SubcategoryItemProps> = ({
  subCategory,
  onDeleteCategory,
  onViewDetail,
  onAddSubcategory,
  onUpdateCategory,
  level = 1, // bắt đầu từ 1 để thụt lề đẹp hơn
}) => {
  const [expanded, setExpanded] = useState(false)

  const hasSubcategories = (category: Category) =>
    category.subCategories && category.subCategories.length > 0

  const toggleExpanded = () => setExpanded((prev) => !prev)

  return (
    <>
      <TableRow
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => onViewDetail(subCategory.categoryId)}
      >
        <TableCell className="text-base py-4 align-middle px-5 ">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${level * 36}px` }}
          >
            {hasSubcategories(subCategory) ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded()
                }}
                className="p-1 h-4 w-4"
              >
                {expanded ? (
                  <ChevronDown className="w-2 h-3" />
                ) : (
                  <ChevronRight className="w-2 h-2" />
                )}
              </Button>
            ) : (
              <div className="w-4 h-4"></div>
            )}
            <span className="font-medium">{subCategory.categoryName}</span>
          </div>
        </TableCell>
        <TableCell className="text-center align-middle px-5">
          <div className="flex items-center justify-center">
            <Image
              src={subCategory.iconURL}
              alt={subCategory.categoryName}
              width={40}
              height={40}
            />
          </div>
        </TableCell>
        <TableCell className="text-center align-middle px-5">
          {subCategory.isDeleted ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
              Đã xóa
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
              Đang hoạt động
            </span>
          )}
        </TableCell>
        <TableCell className="text-center align-middle w-[1%] whitespace-nowrap px-5">
          <div className="flex items-center justify-center gap-2">
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
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onViewDetail(subCategory.categoryId)}
                >
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateCategory(subCategory)}>
                  Chỉnh sửa
                </DropdownMenuItem>
                {!subCategory.isDeleted && (
                  <DropdownMenuItem
                    onClick={() => onAddSubcategory(subCategory)}
                  >
                    Thêm danh mục con
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {subCategory.isDeleted ? (
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() =>
                      onDeleteCategory(
                        subCategory.categoryId,
                        subCategory.categoryName,
                        subCategory.isDeleted
                      )
                    }
                  >
                    Khôi phục
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() =>
                      onDeleteCategory(
                        subCategory.categoryId,
                        subCategory.categoryName,
                        subCategory.isDeleted
                      )
                    }
                  >
                    Xóa
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      {/* Nested subcategories */}
      {expanded &&
        hasSubcategories(subCategory) &&
        subCategory.subCategories?.map((nested) => (
          <SubcategoryItem
            key={nested.categoryId}
            subCategory={nested}
            onDeleteCategory={onDeleteCategory}
            onViewDetail={onViewDetail}
            onAddSubcategory={onAddSubcategory}
            onUpdateCategory={onUpdateCategory}
            level={level + 1}
          />
        ))}
    </>
  )
}

export default SubcategoryItem
