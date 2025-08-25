"use client";
import PriceTag from "@/components/common/PriceTag";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderById } from "@/services/api/order/order";
import { getOrderProductByOrderId } from "@/services/api/order/ordersItem";
import { getProductDetailById } from "@/services/api/product/product";
import { Order, OrderItemResponse } from "@/types/order/order";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function getStatusInfo(status: number) {
  const statusMap = {
    1: {
      label: "Chờ xác nhận",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      description: "Đơn hàng đang chờ shop xác nhận",
    },
    2: {
      label: "Đã xác nhận",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircle,
      description: "Shop đã xác nhận đơn hàng",
    },
    3: {
      label: "Đang chuẩn bị",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Package,
      description: "Shop đang chuẩn bị hàng",
    },
    7: {
      label: "Đang giao hàng",
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: Truck,
      description: "Đơn hàng đang được vận chuyển",
    },
    4: {
      label: "Đã giao hàng",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      description: "Đơn hàng đã được giao thành công",
    },
    5: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      description: "Đơn hàng đã bị hủy",
    },
  };

  return (
    statusMap[status as keyof typeof statusMap] || {
      label: "Không xác định",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: AlertCircle,
      description: "Trạng thái không xác định",
    }
  );
}

function OrderDetails() {
  const params = useParams();
  // Customer route is /customer/(hasSidebar)/order-details/[id]
  const orderId = (params as { id?: string }).id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemResponse[]>([]);
  const [itemAttributes, setItemAttributes] = useState<
    Record<string, Record<string, string>>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        const orderInfo = orderData?.data || orderData;
        setOrder(orderInfo);

        // Fetch order items separately
        try {
          const itemsData = await getOrderProductByOrderId(orderId);

          let items = [];
          if (Array.isArray(itemsData)) {
            items = itemsData;
          } else if (itemsData?.items) {
            items = itemsData.items;
          } else if (itemsData?.data?.items) {
            items = itemsData.data.items;
          } else if (itemsData?.data) {
            items = Array.isArray(itemsData.data) ? itemsData.data : [];
          }

          setOrderItems(items);
        } catch (error) {
          console.error("Error fetching order items:", error);
          setOrderItems(orderInfo?.items || []);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  // Fetch product attributes for items with variants
  useEffect(() => {
    const fetchAttributes = async () => {
      if (orderItems.length > 0) {
        const attrMap: Record<string, Record<string, string>> = {};
        for (const item of orderItems) {
          if (item.productId && item.variantId) {
            try {
              const detail = await getProductDetailById(item.productId);
              const variant = detail?.variants?.find(
                (v: { variantId: string }) => v.variantId === item.variantId
              );
              if (variant) {
                attrMap[item.id] = variant.attributeValues;
              }
            } catch (error) {
              console.error("Error fetching product detail:", error);
            }
          }
        }
        setItemAttributes(attrMap);
      }
    };

    fetchAttributes();
  }, [orderItems]);

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen ">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h2 className="text-xl font-bold">Đơn hàng không tồn tại</h2>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng này</p>
            <Link href="/customer/manage-orders">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại đơn hàng của tôi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.orderStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/customer/manage-orders"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Đơn hàng của tôi
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  {order.orderCode}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Order Status Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <StatusIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Đơn hàng #{order.orderCode}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Đặt hàng lúc{" "}
                    {new Date(order.orderDate).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
              <Badge
                className={`px-4 py-2 text-sm font-medium ${statusInfo.color}`}
              >
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-gray-700 mt-3 text-sm">
              {statusInfo.description}
            </p>
          </div>

          {/* Tracking Information */}
          {order.trackingCode && (
            <CardContent className="border-t bg-blue-25">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <Truck className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Thông tin vận chuyển
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mã vận đơn:</span>
                      <span className="font-mono text-sm font-medium">
                        {order.trackingCode}
                      </span>
                    </div>
                    {order.estimatedDeliveryDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Dự kiến giao:
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(
                            order.estimatedDeliveryDate
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )}
                    {order.actualDeliveryDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Đã giao:</span>
                        <span className="text-sm font-medium text-green-600">
                          {new Date(
                            order.actualDeliveryDate
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Sản phẩm đã đặt ({orderItems.length} sản phẩm)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Không có sản phẩm trong đơn hàng</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item, idx) => {
                  const attrs = itemAttributes[item.id];
                  const isGift =
                    (item.unitPrice ?? 0) === 0 || (item.totalPrice ?? 0) === 0;
                  const attrsText = attrs
                    ? Object.entries(attrs)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")
                    : "";

                  return (
                    <div
                      key={item.id}
                      className={`flex gap-4 p-4 rounded-lg border ${
                        idx !== orderItems.length - 1 ? "border-b" : ""
                      } hover:bg-gray-50 transition-colors`}
                    >
                      <Image
                        src={item.productImageUrl || "/assets/emptydata.png"}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {isGift && (
                                <Badge className="text-xs bg-rose-100 text-rose-700 border-rose-200">
                                  🎁 Quà tặng
                                </Badge>
                              )}
                              <h4 className="font-semibold text-gray-900 line-clamp-2">
                                {item.productName}
                              </h4>
                            </div>
                            {attrsText && (
                              <p className="text-sm text-gray-600 mb-2">
                                {attrsText}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-500">
                                <PriceTag value={item.unitPrice} /> ×{" "}
                                {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg text-rose-600">
                              <PriceTag value={item.totalPrice} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Địa chỉ giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {order.shippingAddress.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{order.shippingAddress.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{order.shippingAddress.addressLine1}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Thông tin thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium">
                    {order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng (COD)"
                      : order.paymentMethod === "BankTransfer"
                      ? "Thanh toán qua QR"
                      : "Không xác định"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền hàng:</span>
                  <span>
                    <PriceTag value={order.totalPrice} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span>
                    <PriceTag value={order.shippingFee} />
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>
                      -<PriceTag value={order.discountAmount} />
                    </span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">
                    Tổng thanh toán:
                  </span>
                  <span className="font-bold text-xl text-rose-600">
                    <PriceTag value={order.finalAmount} />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Notes */}
        {order.customerNotes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Ghi chú của bạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-gray-700">{order.customerNotes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-6">
          <Link href="/customer/manage-orders">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại đơn hàng của tôi
            </Button>
          </Link>
          {order.orderStatus === 5 && (
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Đánh giá sản phẩm
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
