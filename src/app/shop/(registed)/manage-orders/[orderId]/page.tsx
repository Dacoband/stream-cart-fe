"use client";
import React, { useEffect, useState } from "react";
import { getOrderById, updateOrderStatus } from "@/services/api/order/order";
import { getUserById } from "@/services/api/auth/account";
import { getProductDetailById } from "@/services/api/product/product";
import { Order } from "@/types/order/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PriceTag from "@/components/common/PriceTag";
import { toast } from "sonner";
import { getOrderProductByOrderId } from "@/services/api/order/ordersItem";
import { OrderItemResponse } from "@/types/order/order";

function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemResponse[]>([]);
  const [customer, setCustomer] = useState<{
    username: string;
    avatarURL: string | null;
  } | null>(null);
  const [itemAttributes, setItemAttributes] = useState<
    Record<string, Record<string, string>>
  >({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
          // Fallback to order.items if API call fails
          setOrderItems(orderInfo?.items || []);
        }

        // Fetch customer info
        if (orderInfo?.accountId) {
          try {
            const customerData = await getUserById(orderInfo.accountId);
            setCustomer({
              username: customerData?.username || "",
              avatarURL: customerData?.avatarURL || null,
            });
          } catch (error) {
            console.error("Error fetching customer:", error);
          }
        }

        // Fetch product attributes for items with variants
        // We'll do this after orderItems is set
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  // Separate useEffect for fetching attributes after orderItems is loaded
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

  const handleUpdateStatus = async () => {
    if (!order || updating) return;

    let newStatus: number;

    // Logic cập nhật trạng thái theo yêu cầu
    if (order.orderStatus === 0 || order.orderStatus === 1) {
      newStatus = 2; // Chờ xác nhận -> Chờ xử lí
    } else if (order.orderStatus === 2) {
      newStatus = 3; // Chờ xử lí -> Chờ lấy hàng
    } else {
      toast.info("Không thể cập nhật trạng thái đơn hàng này");
      return;
    }

    try {
      setUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      setOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
      toast.success("Cập nhật trạng thái đơn hàng thành công");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
      case 1:
        return { text: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" };
      case 2:
        return { text: "Chờ xử lí", color: "bg-orange-100 text-orange-700" };
      case 3:
        return { text: "Chờ lấy hàng", color: "bg-blue-100 text-blue-700" };
      case 4:
        return {
          text: "Giao hàng thành công",
          color: "bg-green-100 text-green-700",
        };
      case 5:
        return { text: "Đã hủy", color: "bg-red-100 text-red-700" };
      case 7:
        return {
          text: "Chờ giao hàng",
          color: "bg-indigo-100 text-indigo-700",
        };
      case 10:
        return { text: "Thành công", color: "bg-emerald-100 text-emerald-700" };
      default:
        return { text: "Đang giao", color: "bg-gray-100 text-gray-700" };
    }
  };

  const canUpdateStatus =
    order &&
    (order.orderStatus === 0 ||
      order.orderStatus === 1 ||
      order.orderStatus === 2);

  if (loading) {
    return (
      <div className="flex flex-col gap-5 min-h-full">
        <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="mx-5 mb-10 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col gap-5 min-h-full">
        <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
          <h2 className="text-xl font-bold">Đơn hàng không tồn tại</h2>
        </div>
        <div className="mx-5 mb-10 text-center py-10">
          <p className="text-gray-500 mb-4">Không tìm thấy đơn hàng này</p>
          <Link href="/shop/manage-orders">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.orderStatus);

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/shop/manage-orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <h2 className="text-xl font-bold">Đơn hàng {order.orderCode}</h2>
        </div>
        {canUpdateStatus && (
          <Button
            onClick={handleUpdateStatus}
            disabled={updating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updating ? "Đang cập nhật..." : "Cập nhật trạng thái"}
          </Button>
        )}
      </div>

      <div className="mx-5 mb-10 space-y-5">
        {/* Order Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Trạng thái đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
              >
                {statusInfo.text}
              </span>
              <p className="text-sm text-gray-500">
                Ngày đặt:{" "}
                {new Date(order.orderDate).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Thông tin khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {customer?.avatarURL ? (
                <Image
                  src={customer.avatarURL}
                  alt={customer.username || "user"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium">
                  {customer?.username || "Không xác định"}
                </p>
                <p className="text-sm text-gray-500">Khách hàng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Địa chỉ giao hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.phone}
              </p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.addressLine1},{" "}
                {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
                {order.shippingAddress.city}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Sản phẩm đã đặt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có sản phẩm trong đơn hàng</p>
                </div>
              ) : (
                orderItems.map((item) => {
                  const attrs = itemAttributes[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <Image
                        src={item.productImageUrl || "/assets/emptydata.png"}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.productName}
                        </h4>
                        {attrs && (
                          <div className="text-sm text-gray-600 mt-1">
                            {Object.entries(attrs)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Số lượng: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Đơn giá: <PriceTag value={item.unitPrice} />
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-rose-600">
                          <PriceTag value={item.totalPrice} />
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Thông tin thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Phương thức thanh toán:</span>
                <span>
                  {order.paymentMethod === "COD"
                    ? "Thanh toán COD"
                    : order.paymentMethod === "BankTransfer"
                    ? "Thanh toán QR"
                    : "Không xác định"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span>
                  <PriceTag value={order.totalPrice} />
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
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
              <hr />
              <div className="flex justify-between font-medium text-lg">
                <span>Tổng thanh toán:</span>
                <span className="text-rose-600">
                  <PriceTag value={order.finalAmount} />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info Card */}
        {order.trackingCode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Thông tin vận chuyển
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Mã vận đơn:</span>
                  <span className="font-medium">{order.trackingCode}</span>
                </div>
                {order.estimatedDeliveryDate && (
                  <div className="flex justify-between">
                    <span>Ngày giao dự kiến:</span>
                    <span>
                      {new Date(order.estimatedDeliveryDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                )}
                {order.actualDeliveryDate && (
                  <div className="flex justify-between">
                    <span>Ngày giao thực tế:</span>
                    <span>
                      {new Date(order.actualDeliveryDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Notes */}
        {order.customerNotes && (
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú từ khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.customerNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default OrderDetailPage;
