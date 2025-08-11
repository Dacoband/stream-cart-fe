import { format } from 'date-fns'

export const getShopProducts = async (shopId) => {
  return {
    data: [
      {
        id: '1',
        name: 'Áo thun basic premium',
        image:
          'https://i.pinimg.com/736x/41/01/f2/4101f219ef2908ec59886108da5338dc.jpg',
        category: 'Thời trang',
        status: 'Đang bán',
        stock: 150,
        price: 299000,
        sold: 234,
        soldTrend: 'up',
        rating: 4.8,
        revenue: 11700000,
        revenueColor: 'text-lime-500',
        ratingColor: 'text-yellow-400',
        statusColor: 'bg-green-100 text-green-600',
        ratingCount: 120,
        unit: 'đ',
        categorySub: 'Thời trang',
      },
      {
        id: '2',
        name: 'Áo thun basic premium',
        image:
          'https://i.pinimg.com/736x/41/01/f2/4101f219ef2908ec59886108da5338dc.jpg',
        category: 'Thời trang',
        status: 'Hết hàng',
        stock: 0,
        price: 299000,
        sold: 234,
        soldTrend: 'up',
        rating: 4.8,
        revenue: 11700000,
        revenueColor: 'text-lime-500',
        ratingColor: 'text-yellow-400',
        statusColor: 'bg-green-100 text-green-600',
        ratingCount: 120,
        unit: 'đ',
        categorySub: 'Thời trang',
      },
      {
        id: '3',
        name: 'Áo thun basic premium',
        image:
          'https://i.pinimg.com/736x/41/01/f2/4101f219ef2908ec59886108da5338dc.jpg',
        category: 'Thời trang',
        status: 'Đang bán',
        stock: 150,
        price: 299000,
        sold: 234,
        soldTrend: 'up',
        rating: 4.8,
        revenue: 11700000,
        revenueColor: 'text-lime-500',
        ratingColor: 'text-yellow-400',
        statusColor: 'bg-green-100 text-green-600',
        ratingCount: 120,
        unit: 'đ',
        categorySub: 'Thời trang',
      },

      {
        id: '4',
        name: 'Áo thun basic premium',
        image:
          'https://i.pinimg.com/736x/41/01/f2/4101f219ef2908ec59886108da5338dc.jpg',
        category: 'Thời trang',
        status: 'Đang bán',
        stock: 150,
        price: 299000,
        sold: 234,
        soldTrend: 'up',
        rating: 4.8,
        revenue: 11700000,
        revenueColor: 'text-lime-500',
        ratingColor: 'text-yellow-400',
        statusColor: 'bg-green-100 text-green-600',
        ratingCount: 120,
        unit: 'đ',
        categorySub: 'Thời trang',
      },

      {
        id: '5',
        name: 'Áo thun basic premium',
        image:
          'https://i.pinimg.com/736x/41/01/f2/4101f219ef2908ec59886108da5338dc.jpg',
        category: 'Thời trang',
        status: 'Đang bán',
        stock: 150,
        price: 299000,
        sold: 234,
        soldTrend: 'up',
        rating: 4.8,
        revenue: 11700000,
        revenueColor: 'text-lime-500',
        ratingColor: 'text-yellow-400',
        statusColor: 'bg-green-100 text-green-600',
        ratingCount: 120,
        unit: 'đ',
        categorySub: 'Thời trang',
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

export const getShopDetail = async (shopId) => {
  return {
    data: {
      id: shopId,
      shopName: 'Cửa hàng M&H Official',
      logoURL:
        'https://fra.cloud.appwrite.io/v1/storage/buckets/684c3f46003c5ab88377/files/6864cdc7e6a75fef0caf/view?project=684c3edc002461186bef',
      coverImageURL:
        'https://fra.cloud.appwrite.io/v1/storage/buckets/684c3f46003c5ab88377/files/6864cdc7dfb58b23b63b/view?project=684c3edc002461186bef',
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
      approvalStatus: true, // 'pending', 'rejected'
      status: true, // true = hoạt động, false = dừng
      totalOrder: 100,
    },
  }
}

export const shopseller = async (accountId) => {
  return {
    data: {
      id: accountId,
      username: 'myanhnt',
      email: 'myanhnt@example.com',
      phoneNumber: '0987654321',
      fullname: 'Nguyễn Trần Mỹ Anh',
      avatarURL: 'https://i.pravatar.cc/150?u=' + accountId,
      role: 0,
      registrationDate: '2025-07-09T08:32:16.480Z',
      lastLoginDate: '2025-07-09T08:32:16.480Z',
      isActive: true,
      isVerified: true,
      completeRate: 90,
      shopId: accountId, // bạn có thể đổi nếu shopId khác id
      createdAt: '2025-07-09T08:32:16.480Z',
      createdBy: 'admin',
      lastModifiedAt: '2025-07-09T08:32:16.481Z',
      lastModifiedBy: 'admin',
    },
  }
}

export const getShopAddress = async (shopId) => {
  return {
    data: {
      id: shopId,
      recipientName: 'Nguyễn Trần Mỹ Anh',
      street: '123 Đường Lê Lợi',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      city: 'TP.HCM',
      country: 'Việt Nam',
      postalCode: '700000',
      phoneNumber: '0987654321',
      isDefaultShipping: true,
      latitude: 10.7769,
      longitude: 106.7009,
      type: 0, // 0 = shop address | 1 = user address, tuỳ cách bạn quy định
      isActive: true,
      accountId: shopId,
      shopId: shopId,
      createdAt: '2025-07-09T08:35:51.833Z',
      createdBy: 'admin',
      lastModifiedAt: '2025-07-09T08:35:51.833Z',
      lastModifiedBy: 'admin',
    },
  }
}
export const getShopTransactions = async (shopId) => {
  return {
    data: [
      {
        transactionId: 'tx-1',
        type: 'PAYMENT',
        amount: 1250000,
        description: 'Thanh toán đơn hàng #DH1001',
        status: 'COMPLETED',
        createdAt: '2025-07-08T10:00:00Z',
        orderId: 'order-1001',
      },
      {
        transactionId: 'tx-2',
        type: 'REFUND',
        amount: 320000,
        description: 'Hoàn tiền đơn hàng #DH0998',
        status: 'COMPLETED',
        createdAt: '2025-07-07T09:30:00Z',
        refundId: 'refund-0998',
      },
      {
        transactionId: 'tx-3',
        type: 'DEPOSIT',
        amount: 2000000,
        description: 'Nạp tiền vào ví',
        status: 'COMPLETED',
        createdAt: '2025-07-06T15:00:00Z',
      },
    ],
  }
}
// services/api/shop/membership.ts

export const getShopMemberships = async (shopId) => {
  return {
    data: [
      {
        membershipId: 'mem-001',
        name: 'Gói Pro',
        description:
          'Gói dành cho shop bán chuyên, có thêm livestream và hỗ trợ ưu tiên.',
        price: 199000,
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-07-01T00:00:00Z',
        duration: '1 tháng',
        maxProduct: 500,
        maxLivestream: 10,
        commission: 5, // phần trăm
        createdAt: '2025-05-25T10:00:00Z',
        updatedAt: '2025-05-30T08:00:00Z',
      },
      {
        membershipId: 'mem-002',
        name: 'Gói Cơ bản',
        description: 'Gói khởi đầu dành cho shop mới',
        price: 99000,
        startDate: '2025-04-01T00:00:00Z',
        endDate: '2025-05-01T00:00:00Z',
        duration: '1 tháng',
        maxProduct: 100,
        maxLivestream: 2,
        commission: 0, // phần trăm
        createdAt: '2025-03-25T10:00:00Z',
        updatedAt: '2025-03-30T08:00:00Z',
      },
    ],
  }
}
export const getShopOrders = async (shopId) => {
  return {
    data: [
      {
        orderId: 'ORD-001',
        customerName: 'Nguyễn Văn A',
        totalAmount: 1200000,
        status: 'Đang xử lý', // ['Đang xử lý', 'Hoàn thành', 'Đã huỷ']
        createdAt: '2025-07-01T10:30:00.000Z',
      },
      {
        orderId: 'ORD-002',
        customerName: 'Trần Thị B',
        totalAmount: 520000,
        status: 'Hoàn thành',
        createdAt: '2025-06-28T15:45:00.000Z',
      },
      {
        orderId: 'ORD-003',
        customerName: 'Lê Văn C',
        totalAmount: 300000,
        status: 'Đã huỷ',
        createdAt: '2025-06-25T08:20:00.000Z',
      },
    ],
  }
}

export const getOrderDetail = async (id) => {
  return {
    data: [
      {
        orderId: 'ORD001',
        customerName: 'Nguyễn Văn A',
        totalAmount: 350000,
        status: 'COMPLETED',
        createdAt: '2025-07-08T10:00:00Z',
        orderCode: 'ORD001',
        orderDate: '2025-07-08T10:00:00Z',
        paymentStatus: 1,
        shippingFee: 20000,
        discountAmount: 50000,
        finalAmount: 320000,
        estimatedDeliveryDate: '2025-07-10T12:00:00Z',
        actualDeliveryDate: '2025-07-10T11:00:00Z',
        customerNotes: 'Giao hàng trong giờ hành chính',
        trackingCode: 'VNPOST123456',
        shippingAddress: {
          fullName: 'Nguyễn Văn A',
          phone: '0901234567',
          addressLine1: '123 Đường Lê Lợi',
          addressLine2: 'Phường Bến Thành',
          ward: 'Bến Thành',
          district: 'Quận 1',
          city: 'Hồ Chí Minh',
          province: 'Hồ Chí Minh',
          postalCode: '700000',
          country: 'Việt Nam',
          state: '',
          isDefault: true,
        },
        items: [
          {
            id: 'ITEM001',
            productName: 'Áo thun nam cổ tròn',
            quantity: 2,
            unitPrice: 100000,
            discountAmount: 10000,
            totalPrice: 190000,
            productImageUrl:
              'https://fra.cloud.appwrite.io/v1/storage/buckets/684c3f46003c5ab88377/files/686d5c54cc295564ec73/view?project=684c3edc002461186bef&mode=admin',
            notes: '',
          },
          {
            id: 'ITEM002',
            productName: 'Quần jean nữ xanh',
            quantity: 1,
            unitPrice: 160000,
            discountAmount: 0,
            totalPrice: 160000,
            productImageUrl:
              'https://fra.cloud.appwrite.io/v1/storage/buckets/684c3f46003c5ab88377/files/686d5c54cc295564ec73/view?project=684c3edc002461186bef&mode=admin',
            notes: '',
          },
        ],
      },
      // thêm đơn hàng khác nếu cần
    ],
  }
}
