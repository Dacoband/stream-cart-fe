# Manage Orders - Order Status Mapping

## API Endpoint
```
GET /api/orders/account/{accountId}
```

## Query Parameters
- `accountId`: ID của account (required)
- `PageIndex`: Số trang (optional, default: 1)  
- `PageSize`: Số items per page (optional, default: 10)
- `Status`: Filter theo status (optional)

## Order Status Mapping

### Backend Enum (OrderStatus)
```csharp
public enum OrderStatus
{
    Waiting = 0,     // Order đang chờ xác nhận từ shop
    Pending = 1,     // Order đã được xác nhận và đang xử lý
    Processing = 2,  // Order đang được shop xử lý
    Shipped = 3,     // Order đã được ship
    Delivered = 4,   // Order đã giao thành công
    Cancelled = 5,   // Order đã bị hủy
    Packed = 6,      // Order đã đóng gói
    OnDelivere = 7,  // Order đang được giao
    Returning = 8,   // Order đang trong quá trình trả hàng
    Refunded = 9,    // Order đã được hoàn tiền
    Completed = 10,  // Order hoàn thành
}
```

### Frontend UI Mapping
1. **"Tất cả"** (`all`) - Tất cả các trạng thái
2. **"Chờ thanh toán"** (`0`) - `Waiting (0)`
3. **"Vận chuyển"** (`1`) - `Shipped (3)` + `OnDelivere (7)`
4. **"Chờ giao hàng"** (`2`) - `Packed (6)`
5. **"Hoàn thành"** (`3`) - `Delivered (4)` + `Completed (10)`
6. **"Đã hủy"** (`4`) - `Cancelled (5)`
7. **"Trả hàng/Hoàn tiền"** (`5`) - `Returning (8)` + `Refunded (9)`

## Files Structure
```
src/
├── app/customer/(hasSidebar)/manage-orders/
│   └── page.tsx                    # Main manage orders page
├── app/customer/components/
│   ├── OrderItem.tsx               # Individual order display component
│   ├── OrderList.tsx               # List of orders with pagination
│   └── testOrderAPI.ts             # API testing utilities
├── services/api/order/
│   └── customerOrder.ts            # API service for customer orders
└── types/order/
    ├── order.tsx                   # Order type definitions
    └── orderStatus.ts              # Order status enum and utilities
```

## Usage Example
```typescript
import { getCustomerOrders } from '@/services/api/order/customerOrder';

// Get all orders
const allOrders = await getCustomerOrders({
  accountId: "user-id",
  PageIndex: 1,
  PageSize: 10
});

// Get orders with specific status
const waitingOrders = await getCustomerOrders({
  accountId: "user-id",
  PageIndex: 1,  
  PageSize: 10,
  Status: 0  // Waiting status
});
```
