'use client'
import { Button } from '@/components/ui/button'
import { CirclePlus } from 'lucide-react'
import TableCategories from './components/TableCatgories'
import React, { useEffect, useState } from 'react'
import { Category, filterCategory } from '@/types/category/category'
import { getAllCategories } from '@/services/api/categories/categorys'
import CreateCategoryModal from './components/CreateCategoryModal'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

function Categorypage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [isDeleted, setIsDeleted] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const params: filterCategory = {
        PageIndex: pageIndex,
        PageSize: pageSize,
        CategoryName: name,
        IsDeleted: isDeleted,
      }
      const res = await getAllCategories(params)
      console.log(res.data.categories)
      setCategories(res.data.categories || [])
      setTotalPages(res.totalPages || 1)
    } catch (error) {
      console.error(error)
      const err = error as AxiosError<{ message?: string; errors?: string[] }>
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        'Không thể tải danh mục. Vui lòng thử lại!'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [pageIndex, pageSize, name, isDeleted])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddCategoryClick = () => {
    setShowModal(true)
  }

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <CreateCategoryModal
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={fetchData}
      />
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div className="">
          <h2 className="text-xl font-bold  mb-1">Quản lý danh mục</h2>
          <h2 className="text-black/70">
            Quản lý toàn bộ danh mục sản phẩm của sàn
          </h2>
        </div>
        <Button
          className="bg-[#B0F847] text-black shadow flex gap-2 py-5 text-base cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80"
          onClick={handleAddCategoryClick}
        >
          <CirclePlus />
          Thêm danh mục
        </Button>
      </div>
      <div className="flex flex-col gap-5 mx-5 mb-10">
        <TableCategories
          categories={categories}
          loading={loading}
          page={pageIndex}
          setPage={setPageIndex}
          totalPages={totalPages}
          onSearch={setName}
          onRefresh={fetchData}
          statusFilter={isDeleted}
          setStatusFilter={setIsDeleted}
        />
      </div>
    </div>
  )
}

export default Categorypage
