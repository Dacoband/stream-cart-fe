// Order Status Enums from Backend
export enum OrderStatus {
  Waiting = 0,     // Chờ thanh toán
  Pending = 1,
  Processing = 2,
  Shipped = 3,     // Vận chuyển
  Delivered = 4,   // Hoàn thành  
  Cancelled = 5,   // Đã hủy
  Packed = 6,      // Chờ giao hàng
  OnDelivere = 7,  // Vận chuyển
  Returning = 8,   // Trả hàng/Hoàn tiền
  Refunded = 9,    // Trả hàng/Hoàn tiền
  Completed = 10,  // Hoàn thành
}

// UI Tab Values
export type OrderTabValue = 'all' | '0' | '1' | '2' | '3' | '4' | '5';

// Mapping functions
export const getStatusesForTab = (tabValue: OrderTabValue): OrderStatus[] => {
  switch (tabValue) {
    case 'all':
      return Object.values(OrderStatus).filter(status => typeof status === 'number') as OrderStatus[];
    case '0': // Chờ thanh toán
      return [OrderStatus.Waiting];
    case '1': // Vận chuyển
      return [OrderStatus.Shipped, OrderStatus.OnDelivere];
    case '2': // Chờ giao hàng
      return [OrderStatus.Packed];
    case '3': // Hoàn thành
      return [OrderStatus.Delivered, OrderStatus.Completed];
    case '4': // Đã hủy
      return [OrderStatus.Cancelled];
    case '5': // Trả hàng/Hoàn tiền
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
      return 'Đang xử lý';
    case OrderStatus.Shipped:
      return 'Đang vận chuyển';
    case OrderStatus.Delivered:
      return 'Đã giao';
    case OrderStatus.Cancelled:
      return 'Đã hủy';
    case OrderStatus.Packed:
      return 'Đã đóng gói';
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
