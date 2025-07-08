'use client'
import React from 'react'
import { Card } from '@/components/ui/card'

export const ShopProductList = ({ products }: { products: any[] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="p-4">
          <img
            src={product.image || '/assets/nodata.png'}
            alt={product.name}
            className="w-full h-32 object-cover rounded mb-2"
          />
          <div className="font-medium truncate">{product.name}</div>
          <div className="text-sm text-gray-500">Giá: {product.price}₫</div>
        </Card>
      ))}
    </div>
  )
}
