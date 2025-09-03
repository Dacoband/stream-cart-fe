"use client";
import PriceTag from "@/components/common/PriceTag";
// Breadcrumb components were imported previously but unused; removed to satisfy lint.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderById } from "@/services/api/order/order";
import { getOrderProductByOrderId } from "@/services/api/order/ordersItem";
import { getProductDetailById } from "@/services/api/product/product";
import { getOrderReviews } from "@/services/api/review/review";
import { getshopById } from "@/services/api/shop/shop";
import { Order, OrderItemResponse } from "@/types/order/order";
import { Review } from "@/types/review/review";
import { Shop } from "@/types/shop/shop";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Truck,
  XCircle,
  NotebookPen,
  Store,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/services/api/order/order";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatusOrderDetail from "./StatusOrderDetail";
import { Input } from "@/components/ui/input";

function getStatusInfo(status: number) {
  const statusMap = {
    0: {
      label: "Chờ thanh toán",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      description: "Bạn cần thanh toán để tiếp tục đơn hàng",
    },
    1: {
      label: "Chờ xác nhận",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      description: "Đơn hàng đang chờ shop xác nhận",
    },
    2: {
      label: "Đang chuẩn bị",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircle,
      description: "Shop đang đóng gói",
    },
    3: {
      label: "Chờ lấy hàng",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Package,
      description: "Đơn vị vận chuyển đang đến lấy hàng",
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
    10: {
      label: "Đã hoàn thành",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      description: "Đơn hàng đã hoàn thành",
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

// Simple masking helpers for privacy-safe rendering
function maskPhone(phone?: string) {
  if (!phone) return "";
  return phone.replace(/(\d{3})\d{4}(\d{3,})/, "$1****$2");
}

function maskAddress(addr?: string) {
  if (!addr) return "";
  // Keep start and end, mask middle part
  if (addr.length <= 8) return addr;
  return addr.slice(0, 6) + "***" + addr.slice(-4);
}

function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  // Customer route is /customer/(hasSidebar)/order-details/[id]
  const orderId = (params as { id?: string }).id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemResponse[]>([]);
  const [itemAttributes, setItemAttributes] = useState<
    Record<string, Record<string, string>>
  >({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
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

  // Fetch order reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!orderId) return;
      try {
        const reviewsData = await getOrderReviews(orderId);
        setReviews(reviewsData?.data || reviewsData || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
    };
    
    fetchReviews();
  }, [orderId]);

  // Fetch shop information
  useEffect(() => {
    const fetchShop = async () => {
      if (!order?.shopId) return;
      try {
        const shopData = await getshopById(order.shopId);
        setShop(shopData || null);
      } catch (error) {
        console.error("Error fetching shop:", error);
        setShop(null);
      }
    };
    
    fetchShop();
  }, [order?.shopId]);

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

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setUpdating(true);
      await updateOrderStatus(order.id, 5);
      toast.success("Đã hủy đơn hàng");
      router.refresh();
    } catch {
      toast.error("Không thể hủy đơn hàng");
    } finally {
      setUpdating(false);
    }
  };

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

  return (
    <div className="h-[calc(100vh-9rem)] overflow-y-auto custom-scroll ">
      {/* Header */}
      <div className="bg-white flex py-4 px-10 justify-between shadow-sm sticky top-0 z-10">
        <div className="">
          <Link
            href="/customer/manage-orders"
            className="text-lime-600 flex items-center  hover:text-lime-800 text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại đơn hàng
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-black/80 mr-2 pr-2 border-r">
            Mã đơn: {order.orderCode}
          </span>
          <span
            className={`inline-block py-1 px-2 text-xs font-medium border rounded ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="w-full mx-auto px-4 py-8 space-y-6">
        {/* Order Status Card */}
        <StatusOrderDetail order={order} />
        <Card className="rounded-none space-y-5">
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
                <Store className="w-5 h-5 text-orange-600" />
                {shop?.shopName || "Cửa hàng"}
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
          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div>
              <CardHeader className="mb-2">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Đánh giá của bạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => {
                    const orderItem = orderItems.find(item => item.productId === review.productID);
                    return (
                      <div key={review.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex gap-3 mb-3">
                          {orderItem && (
                            <Image
                              src={orderItem.productImageUrl || "/assets/emptyData.png"}
                              alt={orderItem.productName}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-1">
                              {orderItem?.productName || review.productName}
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-2">
                                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            {review.reviewText && (
                              <p className="text-sm text-gray-700 mb-2">
                                {review.reviewText}
                              </p>
                            )}
                            {review.imageUrls && review.imageUrls.length > 0 && (
                              <div className="flex gap-2">
                                {review.imageUrls
                                  .filter((url) => url && typeof url === 'string' && url.trim() !== '')
                                  .map((url, index) => (
                                  <Image
                                    key={index}
                                    src={url.startsWith('http') ? url : `/assets/emptyData.png`}
                                    alt={`Review image ${index + 1}`}
                                    width={60}
                                    height={60}
                                    className="w-15 h-15 object-cover rounded border"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </div>
          )}
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
              <CreditCard className="w-5 h-5 text-purple-600" />
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
              <div className="flex justify-between font-medium text-xl">
                <span>Tổng thanh toán:</span>
                <span className="text-rose-600">
                  <PriceTag value={order.finalAmount} />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirm cancel dialog */}
        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hủy đơn hàng</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể
                hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={updating}>
                Quay lại
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-600/90 text-white"
                disabled={updating}
                onClick={async () => {
                  await handleCancelOrder();
                  setCancelOpen(false);
                }}
              >
                Xác nhận hủy
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default OrderDetails;
