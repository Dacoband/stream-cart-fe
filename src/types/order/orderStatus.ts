// Order Status Enums from Backend
export enum OrderStatus {
  Waiting = 0,     // Chờ thanh toán
  Pending = 1,    // chờ xác  nhận
  Processing = 2,  // Chờ đóng gói
  Shipped = 3,     // Chờ Vận chuyển
  Delivered = 4,   // Giao thành công 
  Cancelled = 5,   // Đã hủy
  // Packed = 6,      // Chờ giao hàng
  OnDelivere = 7,  // Vận chuyển
  Returning = 8,   // Trả hàng/Hoàn tiền
  Refunded = 9,    // Trả hàng/Hoàn tiền
  Completed = 10,  // Hoàn thành
}

// UI Tab Values
// Combined values are represented as hyphen-joined strings, e.g., '3-7' for shipping, '4-10' for success
export type OrderTabValue = 'all' | '0' | '1' | '2' | '3-7' | '4-10' | '5' | '8-9';

// Mapping functions
export const getStatusesForTab = (tabValue: OrderTabValue): OrderStatus[] => {
  switch (tabValue) {
    case 'all':
      return Object.values(OrderStatus).filter((status) => typeof status === 'number') as OrderStatus[];
    case '0': // Chờ thanh toán
      return [OrderStatus.Waiting];
    case '1': // Chờ xác nhận
      return [OrderStatus.Pending];
    case '2': // Chờ đóng gói
      return [OrderStatus.Processing];
    case '3-7': // Chờ giao hàng (đang vận chuyển)
      return [OrderStatus.Shipped, OrderStatus.OnDelivere];
    case '4-10': // Thành công
      return [OrderStatus.Delivered, OrderStatus.Completed];
    case '5': // Hủy đơn
      return [OrderStatus.Cancelled];
    case '8-9': // Trả hàng/Hoàn tiền
      return [OrderStatus.Returning, OrderStatus.Refunded];
    default:
      return [];
  }
};

export const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Waiting:
      return 'Chờ thanh toán';
    case OrderStatus.Pending:
      return 'Chờ xác nhận';
    case OrderStatus.Processing:
      return 'Đang đóng gói';
    case OrderStatus.Shipped:
      return 'Chờ vận chuyển';
    case OrderStatus.Delivered:
      return 'Giao thành công';
    case OrderStatus.Cancelled:
      return 'Đã hủy';
    // case OrderStatus.Packed:
    //   return 'Đã đóng gói';
    case OrderStatus.OnDelivere:
      return 'Đang giao hàng';
    case OrderStatus.Returning:
      return 'Đang trả hàng';
    case OrderStatus.Refunded:
      return 'Đã hoàn tiền';
    case OrderStatus.Completed:
      return 'Hoàn thành';
    default:
      return 'Không xác định';
  }
};
