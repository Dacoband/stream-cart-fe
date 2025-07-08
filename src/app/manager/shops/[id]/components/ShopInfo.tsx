import React from 'react'

export const ShopInfo = ({ shop }: { shop: any }) => {
  const info = [
    ['Mô tả', shop.description],
    ['Gói thành viên', shop.memberPackage || 'Cơ bản'],
    ['Tỉ lệ hoàn thành', `${shop.completeRate}%`],
    ['Tổng sản phẩm', shop.totalProduct],
    [
      'Ngày đăng ký',
      new Date(shop.registrationDate).toLocaleDateString('vi-VN'),
    ],
    ['Tài khoản ngân hàng', `${shop.bankAccountNumber} - ${shop.bankName}`],
    ['Mã số thuế', shop.taxNumber],
    ['Người tạo', shop.createdBy],
    ['Ngày tạo', new Date(shop.createdAt).toLocaleDateString('vi-VN')],
    ['Ngày sửa', new Date(shop.lastModifiedAt).toLocaleDateString('vi-VN')],
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {info.map(([label, value], index) => (
        <div key={index}>
          <div className="mb-1 text-gray-500 text-sm">{label}</div>
          <div className="font-medium break-words">{value}</div>
        </div>
      ))}
    </div>
  )
}
