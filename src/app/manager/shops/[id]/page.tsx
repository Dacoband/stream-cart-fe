'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fakeShops } from '../fakeShops'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Mail,
  Star,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const ShopDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const shop = fakeShops.find((s) => s.id === params.id)

  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'delete' | null
  >(null)

  if (!shop) return <div className="p-8">Không tìm thấy cửa hàng</div>

  const handleConfirmAction = () => {
    switch (actionType) {
      case 'approve':
        console.log('✅ Phê duyệt shop:', shop.id)
        break
      case 'reject':
        console.log('❌ Từ chối shop:', shop.id)
        break
      case 'delete':
        console.log('🗑️ Xóa shop:', shop.id)
        break
      default:
        break
    }
  }

  const handleSendMail = () => {
    console.log('📧 Gửi email tới shop:', shop.id)
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg shadow mt-8">
      {/* Back button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại
      </Button>

      {/* Header */}
      <div className="flex gap-6 items-center mb-6">
        <Image
          src={shop.logoURL}
          alt={shop.shopname}
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{shop.shopname}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-medium text-lg">
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
                size={18}
              />
            ))}
            <span className="ml-4 text-sm text-gray-500">
              ({shop.totalAverage} đánh giá)
            </span>
          </div>
        </div>
      </div>

      {/* Cover */}
      <div className="mb-6">
        <Image
          src={shop.coverImageURL}
          alt="cover"
          width={800}
          height={200}
          className="rounded-lg object-cover w-full h-48"
        />
      </div>

      {/* Status + Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6 justify-between items-center">
        <div className="flex gap-4 flex-wrap">
          <div>
            {shop.approvalStatus === 'approved' ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                Đã duyệt
              </span>
            ) : shop.approvalStatus === 'pending' ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-600">
                Chờ duyệt
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                Từ chối
              </span>
            )}
          </div>
          <div>
            {shop.status ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                Đang hoạt động
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                Dừng hoạt động
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {shop.approvalStatus === 'pending' && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button onClick={() => setActionType('approve')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Phê duyệt
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận phê duyệt?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn phê duyệt cửa hàng này?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmAction}>
                      Đồng ý
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={() => setActionType('reject')}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận từ chối?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này sẽ từ chối cửa hàng và không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmAction}>
                      Từ chối
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          <Button variant="secondary" onClick={handleSendMail}>
            <Mail className="w-4 h-4 mr-2" />
            Gửi email
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button onClick={() => setActionType('delete')} variant="outline">
                <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                Xóa shop
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cửa hàng này sẽ bị xóa vĩnh viễn khỏi hệ thống.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmAction}>
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {[
          ['Mô tả', shop.description],
          ['Gói thành viên', shop.memberPackage || 'Cơ bản'],
          ['Tỉ lệ hoàn thành', `${shop.completeRate}%`],
          ['Tổng sản phẩm', shop.totalProduct],
          [
            'Ngày đăng ký',
            new Date(shop.registrationDate).toLocaleDateString('vi-VN'),
          ],
          [
            'Tài khoản ngân hàng',
            `${shop.bankAccountNumber} - ${shop.bankName}`,
          ],
          ['Mã số thuế', shop.taxNumber],
          ['Người tạo', shop.createdBy],
          ['Ngày tạo', shop.createdAt],
          ['Ngày sửa', shop.lastModifiedAt],
        ].map(([label, value], index) => (
          <div key={index}>
            <div className="mb-1 text-gray-500 text-sm">{label}</div>
            <div className="font-medium break-words">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ShopDetailPage
