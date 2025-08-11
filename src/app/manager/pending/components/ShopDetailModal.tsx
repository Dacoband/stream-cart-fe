import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Address } from '@/types/address/address'
import { User } from '@/types/auth/user'
import { Shop } from '@/types/shop/shop'
import { approveShop, rejectShop } from '@/services/api/shop/shop'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ShopDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shop?: Shop
  shopAddress?: Address
  shopOwner?: User
  clientRendered: boolean
  onRefresh?: () => void
}

const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
  open,
  onOpenChange,
  shop,
  shopAddress,
  shopOwner,
  clientRendered,
  onRefresh,
}) => {
  const [loadingApprove, setLoadingApprove] = useState(false)
  const [loadingReject, setLoadingReject] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async () => {
    if (!shop) return
    setLoadingApprove(true)
    try {
      await approveShop(shop.id)
      toast.success('Phê duyệt cửa hàng thành công!')
      onOpenChange(false)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Error approving shop:', err)
      toast.error('Phê duyệt thất bại!')
    } finally {
      setLoadingApprove(false)
    }
  }

  const handleReject = async () => {
    if (!shop) return
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối!')
      return
    }
    setLoadingReject(true)
    try {
      await rejectShop(shop.id, rejectReason)
      toast.success('Từ chối cửa hàng thành công!')
      setShowRejectDialog(false)
      onOpenChange(false)
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Error rejecting shop:', err)
      toast.error('Từ chối thất bại!')
    } finally {
      setLoadingReject(false)
      setRejectReason('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {!shop ? (
          <div>Không tìm thấy thông tin cửa hàng</div>
        ) : (
          <div className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">
                {shop.shopName || 'Không có tên'}
              </DialogTitle>
              <DialogDescription className="mb-2">
                Mã cửa hàng: {shop.id}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-6 items-start">
              <div className="flex flex-col gap-2 items-center">
                <img
                  src={shop.logoURL || '/logo.png'}
                  alt="Logo"
                  className="w-24 h-24 object-cover rounded-full border"
                />
                <span className="text-xs text-gray-500">Logo</span>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">Chủ cửa hàng:</span>
                  <span>{shopOwner?.fullname || 'Không có chủ shop'}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">Email:</span>
                  <span>{shopOwner?.email || 'Không có email'}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">SĐT:</span>
                  <span>{shopOwner?.phoneNumber || 'Không có SĐT'}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">Địa chỉ:</span>
                  <span>
                    {shopAddress?.street
                      ? `${shopAddress.street}, ${shopAddress.ward}, ${shopAddress.district}, ${shopAddress.city}, ${shopAddress.country}`
                      : 'Không có địa chỉ'}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">Ngân hàng:</span>
                  <span>
                    {shop.bankName && shop.bankAccountNumber
                      ? `${shop.bankName} - ${shop.bankAccountNumber}`
                      : 'Không có thông tin ngân hàng'}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">Ngày đăng ký:</span>
                  <span>
                    {clientRendered && shop.createdAt
                      ? new Date(shop.createdAt).toLocaleDateString('vi-VN')
                      : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold mb-1">Ảnh bìa:</span>
              <img
                src={shop.coverImageURL || '/assets/emptyData.png'}
                alt="Ảnh bìa"
                className="w-full h-40 object-cover rounded-md border"
              />
            </div>
            <DialogFooter>
              <Button
                variant="default"
                className="w-32"
                onClick={handleApprove}
                disabled={loadingApprove || loadingReject}
              >
                {loadingApprove ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Phê duyệt'
                )}
              </Button>
              <Button
                variant="destructive"
                className="w-32"
                onClick={() => setShowRejectDialog(true)}
                disabled={loadingApprove || loadingReject}
              >
                {loadingReject ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Từ chối'
                )}
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-32"
                  disabled={loadingApprove || loadingReject}
                >
                  Đóng
                </Button>
              </DialogClose>
            </DialogFooter>
            {/* Dialog nhập lý do từ chối */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Lý do từ chối cửa hàng</DialogTitle>
                </DialogHeader>
                <textarea
                  className="w-full border rounded p-2 min-h-[80px]"
                  placeholder="Nhập lý do từ chối..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  disabled={loadingReject}
                />
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={loadingReject}
                  >
                    {loadingReject ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Xác nhận từ chối'
                    )}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" disabled={loadingReject}>
                      Hủy
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ShopDetailModal
