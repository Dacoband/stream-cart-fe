import { FormatDate } from "@/components/common/FormatDate";
import PriceTag from "@/components/common/PriceTag";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types/order/order";
import { getStatusText, OrderStatus } from "@/types/order/orderStatus";
import Image from "next/image";
import Link from "next/link";

interface OrderItemProps {
  order: Order;
}

export function OrderItem({ order }: OrderItemProps) {
  const statusText = getStatusText(order.orderStatus as OrderStatus);
  // const [orderItems, setOrderItems] = useState<OrderItemResponse[]>([]);

  console.log(order);

  // Call API to get order items
  // useEffect(() => {
  //   const fetchOrderItems = async () => {
  //     if (order.id) {
  //       try {
  //         console.log(order.id);

  //         const response = await getOrdersItem({ orderId: order.id });
  //         setOrderItems(response.items);
  //       } catch (error) {
  //         console.error("Error fetching order items:", error);
  //       }
  //     }
  //   };

  //   fetchOrderItems();
  // }, [order.id]);

  // console.log(orderItems);
  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Waiting:
        return "destructive";
      case OrderStatus.Shipped:
      case OrderStatus.OnDelivere:
        return "default";
      // case OrderStatus.Packed:
      //   return "secondary";
      case OrderStatus.Delivered:
      case OrderStatus.Completed:
        return "secondary";
      case OrderStatus.Cancelled:
        return "destructive";
      case OrderStatus.Returning:
      case OrderStatus.Refunded:
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Link href={`/customer/order-details/${order.id}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col gap-1">
              <div className="font-medium text-sm">
                Đơn hàng #{order.orderCode}
              </div>
              <div className="text-xs text-gray-500">
                <FormatDate date={order.orderDate} />
              </div>
            </div>
            <Badge
              variant={getStatusBadgeVariant(order.orderStatus as OrderStatus)}
            >
              {statusText}
            </Badge>
          </div>

          <div className="space-y-3">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100">
                    <Image
                      src={item.productImageUrl || "/assets/emptyData.png"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">
                      {item.productName}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Số lượng: {item.quantity}
                    </div>
                    <div className="flex justify-between items-center">
                      <PriceTag value={item.unitPrice} className="text-sm" />
                      <div className="text-sm font-medium">
                        <PriceTag value={item.totalPrice} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Không có sản phẩm nào trong đơn hàng này</p>
              </div>
            )}
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center text-sm">
              <span>Phí vận chuyển:</span>
              <PriceTag value={order.shippingFee} />
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Giảm giá:</span>
                <span>
                  -<PriceTag value={order.discountAmount} />
                </span>
              </div>
            )}
            <div className="flex justify-between items-center font-medium mt-2">
              <span>Tổng cộng:</span>
              <PriceTag value={order.finalAmount} className="text-lg" />
            </div>
          </div>

          {order.customerNotes && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
              <span className="font-medium">Ghi chú: </span>
              {order.customerNotes}
            </div>
          )}

          {order.trackingCode && (
            <div className="mt-2 text-sm text-blue-600">
              Mã vận đơn: {order.trackingCode}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
