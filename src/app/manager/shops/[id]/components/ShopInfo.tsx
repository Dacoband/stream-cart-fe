'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, Search, UserRound } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { AvatarFallback } from '@radix-ui/react-avatar'
import Image from 'next/image'

import { formatDateVN } from '@/components/common/FormatDate'
import type { Shop } from '@/types/shop/shop'
import type { Moderator, User } from '@/types/auth/user'
import type { Address } from '@/types/address/address'

type Props = {
  shop: Shop
  seller?: User | null
  address?: Address | null
  shopOwner?: User | null
  moderators?: Moderator[]
}

export const ShopInfo = ({
  shop,
  seller,
  address,
  shopOwner,
  moderators = [],
}: Props) => {
  const [clientRendered, setClientRendered] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => setClientRendered(true), [])

  const shopInfo = [
    ['Mã số thuế', shop.taxNumber || '—'],
    [
      'Ngày tham gia',
      clientRendered
        ? new Date(shop.registrationDate).toLocaleDateString('vi-VN')
        : '',
    ],
  ]

  const ownerInfo = [
    ['Họ và tên', shopOwner?.fullname || seller?.fullname || '—'],
    ['Email', shopOwner?.email || seller?.email || '—'],
    ['Số điện thoại', shopOwner?.phoneNumber || seller?.phoneNumber || '—'],
    [
      'Tài khoản ngân hàng',
      shop.bankAccountNumber && shop.bankName
        ? `${shop.bankAccountNumber} - ${shop.bankName}`
        : '—',
    ],
    [
      'Địa chỉ',
      address
        ? `${address.street}, ${address.ward}, ${address.district}, ${address.city}`
        : '—',
    ],
  ]

  // Lọc moderator theo tên / username / email / phone
  const filteredModerators = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return moderators
    return moderators.filter((m) => {
      const fields = [m.fullname, m.username, m.email, m.phoneNumber]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase())
      return fields.some((f) => f.includes(q))
    })
  }, [moderators, searchTerm])

  return (
    <div className="space-y-6">
      {/* 2 thẻ info trên cùng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Thông tin chủ shop
          </h2>
          <div className="space-y-3">
            {ownerInfo.map(([label, value], idx) => (
              <div key={idx}>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
            Thông tin cửa hàng
          </h2>
          <div className="space-y-3">
            {shopInfo.map(([label, value], idx) => (
              <div key={idx}>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng Moderator — UI giống TableModerator, lược bỏ thao tác */}
      <Card className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
          Danh sách nhân viên
        </h2>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-4 h-4 text-gray-600" />
            </span>
            <Input
              placeholder="Tìm kiếm tên/username/email/SĐT…"
              className="max-w-full pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#B0F847]/50">
              <TableRow>
                <TableHead className="font-semibold pl-6">Nhân viên</TableHead>
                <TableHead className="font-semibold">Số điện thoại</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">
                  Ngày tạo tài khoản
                </TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredModerators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div>
                      <Image
                        src="/assets/emptydata.png"
                        alt="No data"
                        width={180}
                        height={200}
                        className="mt-6 mx-auto"
                      />
                      <div className="text-center mt-4 text-lime-700/70 font-medium">
                        Chưa có nhân viên nào
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredModerators.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 my-1 ring-2 ring-gray-100">
                          {m.avatarURL ? (
                            <AvatarImage
                              src={m.avatarURL}
                              className="object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-[#B0F847]/50 to-[#aaf53a] text-black font-semibold uppercase flex items-center w-full h-full justify-center">
                              <UserRound />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {m.fullname}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {m.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{m.phoneNumber || '—'}</TableCell>
                    <TableCell>{m.email || '—'}</TableCell>

                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <Calendar size={15} />
                        {m.registrationDate
                          ? formatDateVN(m.registrationDate)
                          : '—'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium ${
                          m.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            m.isActive ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        />
                        {m.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
