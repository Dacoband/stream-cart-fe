export const getShopProducts = async (shopId) => {
  return {
    data: [
      {
        id: 'prod-1',
        name: 'Giày sneaker nam cao cấp',
        image: 'https://source.unsplash.com/random/400x400?shoes',
        price: 850000,
      },
      {
        id: 'prod-2',
        name: 'Áo thun unisex trẻ trung',
        image: 'https://source.unsplash.com/random/400x400?tshirt',
        price: 190000,
      },
      {
        id: 'prod-3',
        name: 'Túi xách nữ thời trang',
        image: 'https://source.unsplash.com/random/400x400?bag',
        price: 350000,
      },
    ],
  }
}
export const getShopActivities = async (shopId) => {
  return {
    data: [
      {
        type: 'Đơn hàng mới',
        message: 'Khách hàng vừa đặt 2 sản phẩm trị giá 1.200.000₫',
        timestamp: new Date().toISOString(),
      },
      {
        type: 'Vi phạm',
        message: 'Sản phẩm “Giày fake” bị cảnh báo vi phạm bản quyền',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // hôm qua
      },
      {
        type: 'Cập nhật sản phẩm',
        message: 'Đã cập nhật ảnh và mô tả sản phẩm “Áo thun cotton”',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 ngày trước
      },
    ],
  }
}
// services/api/shop/extra.ts

export const getShopDetail = async (shopId: string) => {
  return {
    data: {
      id: shopId,
      shopName: 'Cửa hàng M&H Official',
      logoURL: 'https://source.unsplash.com/80x80/?fashion,store',
      coverImageURL: 'https://source.unsplash.com/1200x300/?clothing,shop',
      ratingAverage: 4.3,
      totalAverage: 123,
      description:
        'Chuyên cung cấp các sản phẩm thời trang nam nữ hot trend, chất lượng cao với giá cả hợp lý.',
      memberPackage: 'Gói Pro',
      completeRate: 91,
      totalProduct: 256,
      registrationDate: '2024-04-12T08:00:00.000Z',
      bankAccountNumber: '190123456789',
      bankName: 'Ngân hàng Techcombank',
      taxNumber: '0312345678',
      createdBy: 'admin@mhstore.vn',
      createdAt: '2024-04-10T10:00:00.000Z',
      lastModifiedAt: '2025-07-06T15:30:00.000Z',
      approvalStatus: 'approved', // 'pending', 'rejected'
      status: true, // true = hoạt động, false = dừng
    },
  }
}
