'use client'
import React, { useState } from 'react'
import TableShops from './components/TableShops'
import { fakeShops } from './fakeShops'

const ShopPage = () => {
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Quản lý cửa hàng</h2>
          <h2 className="text-black/70">Quản lý toàn bộ cửa hàng trên sàn</h2>
        </div>
      </div>
      <div className="flex flex-col gap-5 mx-5 mb-10">
        <TableShops shops={fakeShops} loading={false} />
      </div>
    </div>
  )
}

export default ShopPage
