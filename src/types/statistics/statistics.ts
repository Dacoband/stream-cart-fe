// types/order/system-stats.ts

// ====== API response wrapper (tùy backend của bạn) ======
export type ApiResponse<T> = {
  success?: boolean // nhiều service trả field này
  message?: string
  data: T
}

// Nếu backend không có "data" mà trả thẳng object, bạn có thể dùng:
// export type ApiData<T> = T;

// ====== Common ======
export type Period = 'daily' | 'weekly' | 'monthly'

// ====== /api/orders/system/statistics ======
export type ShopPerformanceDTO = {
  shopId: string // Guid -> string
  orderCount: number
  revenue: number
  averageOrderValue: number
}

export type PaymentMethodStatsDTO = {
  orderCount: number
  revenue: number
}

export type DailyOrderTrendDTO = {
  date: string // ISO date string (UTC)
  orderCount: number
  revenue: number
}

export type SystemOrderStatisticsDTO = {
  totalOrders: number
  totalRevenue: number
  totalShippingFee: number
  averageOrderValue: number
  periodStart: string // ISO
  periodEnd: string // ISO

  // breakdowns
  ordersByStatus: Record<string, number> // e.g. { "Delivered": 10, "Processing": 5, ... }
  ordersByPaymentStatus: Record<string, number> // e.g. { "Paid": 12, "Pending": 3, ... }

  // detailed counts
  completeOrderCount: number
  processingOrderCount: number
  canceledOrderCount: number
  pendingOrderCount: number

  // shops
  topShops: ShopPerformanceDTO[]
  totalActiveShops: number

  // payments
  paymentMethodBreakdown: Record<string, PaymentMethodStatsDTO> // key = payment method

  // livestream vs non-livestream
  livestreamOrderCount: number
  livestreamRevenue: number
  nonLivestreamOrderCount: number
  nonLivestreamRevenue: number

  // trends
  dailyTrend: DailyOrderTrendDTO[]
}

// ====== /api/orders/system/top-products ======
export type TopProductDTO = {
  productId: string // Guid -> string
  productName: string
  productImageUrl: string
  salesCount: number
  revenue: number
}

export type TopProductsDTO = {
  products: TopProductDTO[]
}

// ====== /api/orders/system/time-series ======
export type OrderTimePoint = {
  date: string // ISO date (group start)
  label?: string | null // e.g. "Week 35, 2025" hoặc "Sep 2025"
  orderCount: number
  revenue: number
}

export type OrderTimeSeriesDTO = {
  period: Period // "daily" | "weekly" | "monthly"
  fromDate: string // ISO
  toDate: string // ISO
  dataPoints: OrderTimePoint[]
}
