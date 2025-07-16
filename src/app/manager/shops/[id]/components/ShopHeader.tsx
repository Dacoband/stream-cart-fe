'use client'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Star,
  Package,
  ShoppingBag,
  CheckCircle,
  Clock,
  CircleDot,
  CircleOff,
  Trash2,
  Info,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

type SimpleShop = {
  id: string
  shopName: string
  logoURL: string
  coverImageURL: string
  ratingAverage: number
  totalAverage: number
  description: string
  memberPackage: string
  completeRate: number
  totalProduct: number
  status: boolean
  totalOrder: number
  approvalStatus: boolean
}

type Props = {
  shop: SimpleShop
}

const ShopHeader: React.FC<Props> = ({ shop }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    // Simulate API call and show toast
    toast.success('Đã xoá cửa hàng thành công!')
    setOpen(false)
    // TODO: gọi API xoá shop ở đây
  }

  return (
    <div className="py-4 pb-14 bg-white px-5 mb-5 rounded-xl shadow ">
      <Button
        variant="outline"
        className="mb-6 px-5 py-2 rounded-full border-1 border-primary text-primary font-semibold flex items-center gap-2 shadow-sm hover:bg-primary/10 transition"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </Button>

      <div className="relative mb-20 w-95%">
        {/* Cover Image */}
        <Image
          src={shop.coverImageURL || '/assets/nodata.png'}
          alt="cover"
          width={750}
          height={300}
          className="rounded-lg object-cover w-full h-60"
          priority
        />

        {/* Logo + Info */}
        <div className="absolute left-12 -bottom-22 z-10 flex items-end w-[calc(100%-6rem)] justify-between pr-8">
          <div className="flex items-end">
            <Image
              src={shop.logoURL || '/assets/nodata.png'}
              alt={shop.shopName}
              width={140}
              height={140}
              className="rounded-full object-cover aspect-square border-4 border-white shadow-lg bg-white"
            />
            <div className="flex flex-col pt-18 ml-6">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">{shop.shopName}</h1>

                {/* Duyệt */}
                <span
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
                    shop.approvalStatus
                      ? 'bg-green-100 text-green-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  {shop.approvalStatus ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Clock className="w-4 h-4 mr-1" />
                  )}
                  {shop.approvalStatus ? 'Đã duyệt' : 'Chờ duyệt'}
                </span>

                {/* Trạng thái hoạt động */}
                <span
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
                    shop.status
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {shop.status ? (
                    <CircleDot className="w-4 h-4 mr-1" />
                  ) : (
                    <CircleOff className="w-4 h-4 mr-1" />
                  )}
                  {shop.status ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </span>
              </div>

              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <span className="font-medium text-xs">
                  {shop.ratingAverage.toFixed(1)}
                </span>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(shop.ratingAverage)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }
                    size={10}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-1">
                  ({shop.totalAverage} đánh giá)
                </span>

                <div className="ml-4 flex items-center">
                  <Package className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {shop.totalProduct} sản phẩm
                  </span>
                </div>
                <div className="ml-4 flex items-center">
                  <ShoppingBag className="w-4 h-4 mr-1 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {shop.totalOrder} đơn hàng
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Nút xoá */}
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className="absolute right-0 top-1/2"
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Xóa shop
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                Bạn có chắc chắn muốn xóa cửa hàng này không?
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div
        className="ml-48
      w-2/3 p-4 text-gray-500 text-base"
      >
        {shop.description}
      </div>
    </div>
  )
}

export default ShopHeader
