'use client'

import React, { useState, useEffect } from 'react'
import { AllOrderFilters } from './components/OrderFilter'
import { ListShop } from '@/types/shop/shop'
import { getAllShops } from '@/services/api/shop/shop'
import { AllOrderList } from './components/OrderTable'

export default function AllOrdersPage() {
  const [shops, setShops] = useState<{ id: string; shopName: string }[]>([])
  const [filters, setFilters] = useState({
    shopId: null as string | null,
    startDate: null as Date | null,
    endDate: null as Date | null,
    statuses: null as number[] | null,
  })
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res: ListShop = await getAllShops({
          pageNumber: 1,
          pageSize: 100,
          status: '',
          approvalStatus: '',
          searchTerm: '',
          sortBy: '',
          ascending: true,
        })
        console.log('Fetched shops:', res)
        const options = (res.items || []).map((s) => ({
          id: s.id,
          shopName: s.shopName,
        }))

        setShops(options)
      } catch (error) {
        console.error('Error fetching shops:', error)
        setShops([])
      }
    }

    fetchShops()
  }, [])

  return (
    <div className=" mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Tất cả đơn hàng</h2>
      <AllOrderFilters
        shops={shops}
        filters={filters}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            shopId: null,
            startDate: null,
            endDate: null,
            statuses: null,
          })
        }
      />
      <AllOrderList filters={filters} />
    </div>
  )
}
