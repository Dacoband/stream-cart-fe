type Props = {
  shop: any
  seller: any
  address: any
}

export const ShopInfo = ({ shop, seller, address }: Props) => {
  const shopInfo = [
    ['Gói thành viên', shop.memberPackage || 'Cơ bản'],
    ['Mã số thuế', shop.taxNumber || '—'],
    [
      'Ngày tham gia',
      new Date(shop.registrationDate).toLocaleDateString('vi-VN'),
    ],
  ]

  const ownerInfo = [
    ['Họ và tên', seller?.fullname || '—'],
    ['Email', seller?.email || '—'],
    ['Số điện thoại', seller?.phoneNumber || '—'],
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

  return (
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
  )
}
