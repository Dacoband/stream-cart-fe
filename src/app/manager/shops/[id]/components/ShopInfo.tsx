import React, { useState, useEffect } from "react";
import { UserRound, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { formatDateVN } from "@/components/common/FormatDate";
import { Shop } from "@/types/shop/shop";
import { User } from "@/types/auth/user";
import { Address } from "@/types/address/address";

type Props = {
  shop: Shop;
  seller?: User | null;
  address?: Address | null;
  shopOwner?: User | null;
  moderators?: User[];
};

export const ShopInfo = ({
  shop,
  seller,
  address,
  shopOwner,
  moderators = [],
}: Props) => {
  const [clientRendered, setClientRendered] = useState(false);

  useEffect(() => {
    setClientRendered(true);
  }, []);

  const shopInfo = [
    ["Mã số thuế", shop.taxNumber || "—"],
    [
      "Ngày tham gia",
      clientRendered
        ? new Date(shop.registrationDate).toLocaleDateString("vi-VN")
        : "",
    ],
  ];

  const ownerInfo = [
    ["Họ và tên", shopOwner?.fullname || seller?.fullname || "—"],
    ["Email", shopOwner?.email || seller?.email || "—"],
    ["Số điện thoại", shopOwner?.phoneNumber || seller?.phoneNumber || "—"],
    [
      "Tài khoản ngân hàng",
      shop.bankAccountNumber && shop.bankName
        ? `${shop.bankAccountNumber} - ${shop.bankName}`
        : "—",
    ],
    [
      "Địa chỉ",
      address
        ? `${address.street}, ${address.ward}, ${address.district}, ${address.city}`
        : "—",
    ],
  ];

  return (
    <div className="space-y-6">
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

      {/* Bảng Moderator */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
          Danh sách nhân viên
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#B0F847]/50">
              <TableRow>
                <TableHead className="font-semibold">Nhân viên</TableHead>
                <TableHead className="font-semibold">Số điện thoại</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">
                  Ngày tạo tài khoản
                </TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moderators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-gray-500">Chưa có nhân viên nào</div>
                  </TableCell>
                </TableRow>
              ) : (
                moderators.map((moderator) => (
                  <TableRow key={moderator.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          {moderator.avatarURL ? (
                            <AvatarImage
                              src={moderator.avatarURL}
                              className="object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-[#B0F847]/50 to-[#aaf53a] text-black font-semibold">
                              <UserRound className="w-4 h-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {moderator.fullname}
                          </p>
                          <p className="text-sm text-gray-500">
                            {moderator.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{moderator.phoneNumber}</TableCell>
                    <TableCell>{moderator.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <Calendar size={15} />
                        {moderator.registrationDate &&
                          formatDateVN(moderator.registrationDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium
                          ${
                            moderator.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            moderator.isActive ? "bg-green-600" : "bg-red-600"
                          }`}
                        />
                        {moderator.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
