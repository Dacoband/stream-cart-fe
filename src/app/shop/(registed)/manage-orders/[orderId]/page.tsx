"use client";
import React, { useEffect, useState } from "react";
import { getOrderById } from "@/services/api/order/order";
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
  NotebookPen,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PriceTag from "@/components/common/PriceTag";
import { toast } from "sonner";
import { getOrderProductByOrderId } from "@/services/api/order/ordersItem";
import { OrderItemResponse } from "@/types/order/order";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import StatusOrder from "../components/StatusOrder";
import { Input } from "@/components/ui/input";
function maskAddress(address: string) {
  if (!address) return "";
  if (address.length <= 5) return "*****";
  return "*****" + address.slice(5);
}

function maskPhone(phone: string) {
  if (!phone) return "";

  return phone.slice(0, 3) + "*".repeat(phone.length - 6) + phone.slice(-3);
}
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

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        const orderInfo = orderData?.data || orderData;
        setOrder(orderInfo);

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
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderId]);

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

  const handleStatusUpdated = (newStatus: number) => {
    setOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : prev));
  };

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

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="font-medium text-lg cursor-pointer">
              <BreadcrumbLink asChild>
                <Link href="/shop/manage-orders">Quản lí đơn hàng</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-lg">
                {order.orderCode}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mx-10 mb-10 space-y-5 ">
        {/* Order Status Card */}
        <StatusOrder order={order} onStatusUpdated={handleStatusUpdated} />

        {/* Customer Info Card */}
        <Card className="rounded-none space-y-5">
          <div>
            <CardHeader className="mb-2">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-lime-600" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="">
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
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <CardHeader className="mb-2">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-lime-600" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    <span>Người nhận: </span>
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span>SĐT: </span> {maskPhone(order.shippingAddress.phone)}
                  </p>

                  <p className="text-sm text-gray-600">
                    <span>Địa chỉ: </span>{" "}
                    {maskAddress(order.shippingAddress.addressLine1)}
                  </p>
                </div>
              </CardContent>
            </div>
            <div className="h-full">
              {order.trackingCode && (
                <>
                  <CardHeader className="mb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-lime-600" />
                      Thông tin vận chuyển
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mã vận đơn:</span>
                        <span className="font-medium">
                          {order.trackingCode}
                        </span>
                      </div>
                      {order.estimatedDeliveryDate && (
                        <div className="flex justify-between">
                          <span>Ngày giao dự kiến:</span>
                          <span>
                            {new Date(
                              order.estimatedDeliveryDate
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      )}
                      {order.actualDeliveryDate && (
                        <div className="flex justify-between">
                          <span>Ngày giao thực tế:</span>
                          <span>
                            {new Date(
                              order.actualDeliveryDate
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </>
              )}
            </div>
          </div>
          <div>
            <CardHeader className="mb-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-lime-600" />
                Sản phẩm đã đặt
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có sản phẩm trong đơn hàng</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-20 bg-gray-50 text-sm font-medium text-gray-600 px-4 py-2">
                    <div className="col-span-1">STT</div>
                    <div className="col-span-7">Sản phẩm</div>
                    <div className="col-span-4 text-right">Đơn giá</div>
                    <div className="col-span-4 text-right">Số lượng</div>
                    <div className="col-span-4 text-right">Thành tiền</div>
                  </div>
                  {orderItems.map((item, idx) => {
                    const attrs = itemAttributes[item.id];

                    const attrsText = attrs
                      ? Object.entries(attrs)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")
                      : "";
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-20 gap-3 px-4 py-3 border-t"
                      >
                        <div className="col-span-1 flex items-center text-sm text-gray-700">
                          {idx + 1}
                        </div>
                        <div className="col-span-7 flex gap-3">
                          <Image
                            src={
                              item.productImageUrl || "/assets/emptydata.png"
                            }
                            alt={item.productName}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className="font-medium text-gray-900 truncate"
                                title={item.productName}
                              >
                                {item.productName}
                              </h4>
                            </div>
                            {attrsText && (
                              <div className="text-xs text-gray-600 mt-1">
                                {attrsText}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-span-4 text-right text-sm text-gray-700">
                          <PriceTag value={item.unitPrice} />
                        </div>
                        <div className="col-span-4 text-right text-sm text-gray-700">
                          {item.quantity}
                        </div>
                        <div className="col-span-4 text-right font-medium text-rose-600">
                          <PriceTag value={item.totalPrice} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </div>
          <div>
            <CardHeader className="mb-2">
              <CardTitle className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-lime-600" />
                Ghi chú từ khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.customerNotes ? (
                <Input
                  className="text-gray-700"
                  value={order.customerNotes}
                  readOnly
                />
              ) : (
                <Input
                  className="text-gray-500 rounded-none"
                  value="Không có ghi chú"
                  readOnly
                />
              )}
            </CardContent>
          </div>
        </Card>
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-lime-600" />
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
                <div className="flex justify-between text-orange-600">
                  <span>Giảm giá:</span>
                  <span>
                    -<PriceTag value={order.discountAmount} />
                  </span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-medium text-base">
                <span>Tổng thanh toán:</span>
                <span className="text-rose-600">
                  <PriceTag value={order.finalAmount} />
                </span>
              </div>
              <hr />
              <div className="flex justify-between font-medium text-lg">
                <span>Doanh thu:</span>
                <span className="text-rose-600">
                  <PriceTag value={order.netAmount} />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrderDetailPage;
