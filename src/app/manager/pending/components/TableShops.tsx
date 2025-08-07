'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

import { Card } from '@/components/ui/card'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Star,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Shop, ShopMember } from '@/types/shop/shop'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { User } from '@/types/auth/user'
import { Address } from '@/types/address/address'
import { getAddressByShopId } from '@/services/api/address/address'
import { getShopMembers } from '@/services/api/shop/shop'
import { getUserById } from '@/services/api/auth/account'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { DialogTrigger } from '@/components/ui/dialog'
import ShopDetailModal from './ShopDetailModal'

type Props = {
  shops: Shop[]
  loading: boolean
  onSearch: (value: string) => void
  onRefresh: () => void
  pageNumber: number
  setPageNumber: (page: number) => void
  totalPages: number
  totalCount: number
}

const TableShops: React.FC<Props> = ({
  shops,
  loading,
  onSearch,
  onRefresh,
  pageNumber,
  setPageNumber,
  totalPages,
  totalCount,
}) => {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [shopAddresses, setShopAddresses] = useState<{
    [shopId: string]: Address | null
  }>({})
  const [shopOwners, setShopOwners] = useState<{
    [shopId: string]: User | null
  }>({})
  const [clientRendered, setClientRendered] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    setClientRendered(true)
  }, [])

  useEffect(() => {
    if (!shops || shops.length === 0) return
    const fetchData = async () => {
      const addressPromises = shops.map(async (shop) => {
        try {
          const address = await getAddressByShopId(shop.id)
          console.log('address', address)
          return { shopId: shop.id, address }
        } catch {
          return { shopId: shop.id, address: null }
        }
      })
      const ownerPromises = shops.map(async (shop) => {
        try {
          if (!shop.createdBy) return { shopId: shop.id, owner: null }
          const owner = await getUserById(shop.createdBy)
          console.log('owner', owner)
          return { shopId: shop.id, owner }
        } catch {
          return { shopId: shop.id, owner: null }
        }
      })
      const addresses = await Promise.all(addressPromises)
      const owners = await Promise.all(ownerPromises)
      setShopAddresses(
        Object.fromEntries(addresses.map((a) => [a.shopId, a.address]))
      )
      setShopOwners(Object.fromEntries(owners.map((o) => [o.shopId, o.owner])))
    }
    fetchData()
  }, [shops])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(searchValue)
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchValue, onSearch])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage)
    }
  }

  const handleOpenModal = (shopId: string) => {
    setSelectedShopId(shopId)
    setModalOpen(true)
  }
  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedShopId(null)
  }

  return (
    <Card className="bg-white py-5 px-8 overflow-x-auto">
      {/* Tìm kiếm & lọc */}
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="text-gray-600" />
            </span>
            <Input
              placeholder="Tìm kiếm tên cửa hàng..."
              className="max-w-full pl-12"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="min-w-[900px] w-full">
        <Table className="w-full table-auto border-t border-gray-200">
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="w-[30%] text-base py-4 px-5">
                Tên cửa hàng
              </TableHead>
              <TableHead className="text-center text-base px-5 w-[20%]">
                Tên chủ cửa hàng
              </TableHead>
              <TableHead className="text-center text-base px-5 w-[20%]">
                Địa chỉ
              </TableHead>
              <TableHead className="text-center text-base px-5 w-[20%]">
                Ngân hàng
              </TableHead>
              <TableHead className="text-center text-base px-5 w-[10%]">
                Ngày đăng ký
              </TableHead>
              <TableHead className="text-right text-base px-5 w-[10%]">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    <span className="ml-2">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !loading && (shops || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="flex flex-col items-center justify-center py-10">
                    <Image
                      src="/assets/nodata.png"
                      alt="No data"
                      width={300}
                      height={200}
                      className="mb-4"
                    />
                    <p className="text-gray-500 text-base">
                      Không có cửa hàng nào
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              shops.map((shop) => {
                if (!shop || !shop.id) return null

                const shopName =
                  (shop as any).shopName ||
                  (shop as any).name ||
                  (shop as any).title ||
                  'Không có tên'

                const shopAddress = shopAddresses[shop.id] as
                  | Address
                  | undefined
                const shopOwner = shopOwners[shop.id] as User | undefined
                const address = shopAddress?.street
                  ? `${shopAddress.street}, ${shopAddress.ward}, ${shopAddress.district}, ${shopAddress.city}, ${shopAddress.country}`
                  : 'Không có địa chỉ'

                return (
                  <TableRow
                    key={shop.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenModal(shop.id)}
                  >
                    <TableCell className="px-5 py-4 text-base font-medium">
                      {shopName}
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      {shopOwner?.fullname || 'Không có chủ shop'}
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      {address}
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      {shop.bankName && shop.bankAccountNumber
                        ? shop.bankName + ' - ' + shop.bankAccountNumber
                        : 'Không có thông tin ngân hàng'}
                    </TableCell>
                    <TableCell className="text-center align-middle px-5">
                      {clientRendered && shop.createdAt
                        ? new Date(shop.createdAt).toLocaleDateString('vi-VN')
                        : ''}
                    </TableCell>
                    <TableCell className="text-right align-middle px-5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenModal(shop.id)
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Hiển thị {(pageNumber - 1) * 10 + 1} -{' '}
            {Math.min(pageNumber * 10, totalCount)} trong tổng số {totalCount}{' '}
            cửa hàng
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Trang {pageNumber} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal hiển thị chi tiết shop */}
      <ShopDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        shop={
          selectedShopId
            ? shops.find((s) => s.id === selectedShopId)
            : undefined
        }
        shopAddress={
          selectedShopId
            ? shopAddresses[selectedShopId] || undefined
            : undefined
        }
        shopOwner={
          selectedShopId ? shopOwners[selectedShopId] || undefined : undefined
        }
        clientRendered={clientRendered}
        onRefresh={onRefresh}
      />
    </Card>
  )
}

export default TableShops
