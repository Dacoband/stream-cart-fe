'use client'
import React, { useState, useEffect } from 'react'
import TableShops from './components/TableShops'
import { Shop, FilterShop } from '@/types/shop/shop'
import { getAllShops } from '@/services/api/shop/shop'
import { toast } from 'sonner'

const ShopPage = () => {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>('')

  const fetchShops = async () => {
    try {
      setLoading(true)
      const filter: FilterShop = {
        pageNumber,
        pageSize,
        status: statusFilter,
        approvalStatus: 'Approved',
        searchTerm,
        sortBy: 'shopName',
        ascending: true,
      }

      const response = await getAllShops(filter)
      console.log('Shops response:', response)
      console.log('Shops data structure:', JSON.stringify(response, null, 2))

      // Kiểm tra các cấu trúc response có thể có
      let shopsData = []
      let totalPagesData = 1
      let totalCountData = 0

      if (response) {
        if (response.items) {
          shopsData = response.items
          totalPagesData = response.totalPages || 1
          totalCountData = response.totalCount || 0
        } else if (response.data && response.data.items) {
          shopsData = response.data.items
          totalPagesData = response.data.totalPages || 1
          totalCountData = response.data.totalCount || 0
        } else if (response.data && Array.isArray(response.data)) {
          shopsData = response.data
        } else if (Array.isArray(response)) {
          shopsData = response
        } else if (response.shops) {
          shopsData = response.shops
        } else if (response.categories) {
          shopsData = response.categories
        }
      }

      console.log('Extracted shops data:', shopsData)
      console.log('First shop item:', shopsData[0])

      setShops(shopsData)
      setTotalPages(totalPagesData)
      setTotalCount(totalCountData)
    } catch (error) {
      console.error('Error fetching shops:', error)
      toast.error('Không thể tải danh sách cửa hàng')
      setShops([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [pageNumber, pageSize, statusFilter, approvalStatusFilter])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPageNumber(1) // Reset to first page when searching
      fetchShops()
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPageNumber(1)
  }

  const handleApprovalStatusFilter = (status: string) => {
    setApprovalStatusFilter(status)
    setPageNumber(1)
  }

  const handleRefresh = () => {
    fetchShops()
  }

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Quản lý cửa hàng</h2>
          <h2 className="text-black/70">Quản lý toàn bộ cửa hàng trên sàn</h2>
        </div>
      </div>
      <div className="flex flex-col gap-5 mx-5 mb-10">
        <TableShops
          shops={shops}
          loading={loading}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onApprovalStatusFilter={handleApprovalStatusFilter}
          onRefresh={handleRefresh}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      </div>
    </div>
  )
}

export default ShopPage
