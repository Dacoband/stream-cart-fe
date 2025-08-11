'use client'

import React, { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  deleteCategory,
  getDetailCategory,
} from '@/services/api/categories/categorys'
import { toast } from 'sonner'
import Image from 'next/image'
import { MoreHorizontal, Trash2, Undo2, CirclePlus } from 'lucide-react'
import CreateCategoryModal from './CreateCategoryModal'
import { AxiosError } from 'axios'

interface CategoryDetailModalProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRefresh: () => void
  level?: number
  parentPath?: string
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  category,
  open,
  onOpenChange,
  onRefresh,
  level = 0,
  parentPath = '',
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string
    name: string
    isDeleted: boolean
  } | null>(null)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Category | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedParentCategoryID, setSelectedParentCategoryID] =
    useState<string>('')
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedCategoryForUpdate, setSelectedCategoryForUpdate] =
    useState<Category | null>(null)
  const [categoryDetail, setCategoryDetail] = useState<Category | null>(
    category
  )

  useEffect(() => {
    setCategoryDetail(category)
  }, [category])

  const handleDeleteCategory = (
    categoryId: string,
    categoryName: string,
    isDeleted: boolean
  ) => {
    setSelectedCategory({ id: categoryId, name: categoryName, isDeleted })
    setShowConfirmDialog(true)
  }

  const reloadCategoryDetail = async (id: string) => {
    try {
      const detail = await getDetailCategory(id)
      if (detail && detail.data) setCategoryDetail(detail.data)
    } catch (error) {
      console.log(error)
      /* handle error if needed */
    }
  }

  const confirmDelete = async () => {
    if (!selectedCategory) return
    const actionText = selectedCategory.isDeleted ? 'Khôi phục' : 'Xóa'
    try {
      await deleteCategory(selectedCategory.id)
      toast.success(
        `${actionText} danh mục "${selectedCategory.name}" thành công!`
      )
      onRefresh()
      setShowConfirmDialog(false)
      setSelectedCategory(null)
      // reload detail in modal
      reloadCategoryDetail(selectedCategory.id)
    } catch (error) {
      console.error('Create user failed:', error)
      const err = error as AxiosError<{ message?: string; errors?: string[] }>
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        `Không thể ${actionText.toLowerCase()} danh mục. Vui lòng thử lại!`
      toast.error(message)
      toast.error(message)
    }
  }

  const handleViewSubcategoryDetail = (subcategory: Category) => {
    setSelectedSubcategory(subcategory)
    setShowSubcategoryModal(true)
  }

  const handleUpdateCategory = (category: Category) => {
    setSelectedCategoryForUpdate(category)
    setShowUpdateModal(true)
  }

  const handleUpdateModalClose = () => {
    setShowUpdateModal(false)
    setSelectedCategoryForUpdate(null)
  }

  const getBreadcrumbPath = () => {
    if (!categoryDetail) return ''
    if (!parentPath) return categoryDetail.categoryName
    return `${parentPath} > ${categoryDetail.categoryName}`
  }

  if (!categoryDetail) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[80vw] !max-w-none h-[90vh] overflow-y-auto rounded-lg shadow-xl">
          <DialogHeader className="pb-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Image
                  src={categoryDetail.iconURL}
                  alt={categoryDetail.categoryName}
                  width={100}
                  height={100}
                  className="rounded-lg border"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl font-bold mb-2">
                      {getBreadcrumbPath()}
                    </DialogTitle>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">Trạng thái:</span>
                      {categoryDetail.isDeleted ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          Đã xóa
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                          Đang hoạt động
                        </span>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 text-sm text-red-500 hover:text-red-600"
                        onClick={() =>
                          handleDeleteCategory(
                            categoryDetail.categoryId,
                            categoryDetail.categoryName,
                            categoryDetail.isDeleted
                          )
                        }
                      >
                        {categoryDetail.isDeleted ? (
                          <>
                            <Undo2 className="w-4 h-4 mr-1" /> Khôi phục
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" /> Xóa
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Slug
                  </label>
                  <p className="text-base mt-1">
                    {categoryDetail.slug || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mô tả
                  </label>
                  <p className="text-base mt-1">
                    {categoryDetail.description || 'Không có mô tả'}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <label className="text-sm font-medium text-gray-500 mr-2">
                  Danh mục con ({categoryDetail.subCategories?.length || 0})
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-700"
                  disabled={categoryDetail.isDeleted}
                  onClick={() => {
                    setSelectedParentCategoryID(categoryDetail.categoryId)
                    setShowCreateModal(true)
                  }}
                >
                  <CirclePlus className="w-4 h-4 mr-1" /> Thêm danh mục con
                </Button>
              </div>
              {categoryDetail.subCategories?.length ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[#B0F847]/50">
                      <TableRow>
                        <TableHead className="w-[50%] text-base py-3 font-medium px-4">
                          Tên danh mục
                        </TableHead>
                        <TableHead className="text-center text-base font-medium px-4">
                          Hình ảnh
                        </TableHead>
                        <TableHead className="text-center text-base font-medium px-4">
                          Trạng thái
                        </TableHead>
                        <TableHead className="text-center text-base font-medium w-[1%] whitespace-nowrap px-4">
                          Hành động
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryDetail.subCategories.map((sub) => (
                        <TableRow
                          key={sub.categoryId}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleViewSubcategoryDetail(sub)}
                        >
                          <TableCell className="text-base py-3 align-middle px-4 font-medium">
                            {sub.categoryName}
                          </TableCell>
                          <TableCell className="text-center align-middle px-4">
                            <div className="flex items-center justify-center">
                              <Image
                                src={sub.iconURL}
                                alt={sub.categoryName}
                                width={40}
                                height={40}
                                className="rounded"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center align-middle px-4">
                            {sub.isDeleted ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                Đã xóa
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                                Đang hoạt động
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center align-middle w-[1%] whitespace-nowrap px-4">
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
                                  onClick={() =>
                                    handleViewSubcategoryDetail(sub)
                                  }
                                >
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateCategory(sub)}
                                >
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                {!sub.isDeleted && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedParentCategoryID(
                                        sub.categoryId
                                      )
                                      setShowCreateModal(true)
                                    }}
                                  >
                                    Thêm danh mục con
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={() =>
                                    handleDeleteCategory(
                                      sub.categoryId,
                                      sub.categoryName,
                                      sub.isDeleted
                                    )
                                  }
                                >
                                  {sub.isDeleted ? 'Khôi phục' : 'Xóa'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <Image
                    src="/assets/nodata.png"
                    alt="No data"
                    width={200}
                    height={100}
                    className="mb-4"
                  />
                  <p className="text-gray-500 text-base">
                    Không có danh mục con
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory?.isDeleted
                ? 'Khôi phục danh mục'
                : 'Xóa danh mục'}
            </DialogTitle>
            <p>
              Bạn có chắc chắn muốn{' '}
              {selectedCategory?.isDeleted ? 'khôi phục' : 'xóa'} danh mục{' '}
              {selectedCategory?.name} không? Hành động này không thể hoàn tác.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={confirmDelete}
            >
              {selectedCategory?.isDeleted ? 'Khôi phục' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Chi tiết Subcategory */}
      {selectedSubcategory && (
        <CategoryDetailModal
          category={selectedSubcategory}
          open={showSubcategoryModal}
          onOpenChange={setShowSubcategoryModal}
          onRefresh={onRefresh}
          level={level + 1}
          parentPath={getBreadcrumbPath()}
        />
      )}

      <CreateCategoryModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open)
          if (!open) setSelectedParentCategoryID('')
        }}
        onSuccess={() => {
          setShowCreateModal(false)
          setSelectedParentCategoryID('')
          onRefresh()
        }}
        parentCategoryID={selectedParentCategoryID}
      />

      {/* Update Category Modal */}
      <CreateCategoryModal
        open={showUpdateModal}
        onOpenChange={handleUpdateModalClose}
        onSuccess={() => {
          setShowUpdateModal(false)
          setSelectedCategoryForUpdate(null)
          onRefresh()
        }}
        mode="update"
        initialData={selectedCategoryForUpdate}
      />
    </>
  )
}

export default CategoryDetailModal
