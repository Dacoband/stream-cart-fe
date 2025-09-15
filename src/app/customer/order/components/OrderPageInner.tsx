"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddressOrder from "./AddressOrder";
import ProductsOrder from "./ProductsOrder";
import MethodOrder from "./MethodOrder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PriceTag from "@/components/common/PriceTag";
import { previewOrder } from "@/services/api/cart/cart";
import { PreviewOrder } from "@/types/Cart/Cart";
import { previewOrderLive } from "@/services/api/livestream/livestreamCart";
import { PreviewOrderLive } from "@/types/livestream/cartLive";
import { CreateOrder, Order } from "@/types/order/order";
import { createOrder } from "@/services/api/order/order";
import { Address } from "@/types/address/address";
import {
  PreviewDeliveries,
  PreviewDeliveriesResponse,
} from "@/types/deliveries/deliveries";
import { previewDeliveries } from "@/services/api/deliveries/deliveries";
import { deleteCart } from "@/services/api/cart/cart";
import { livestreamCartClient } from "@/services/signalr/livestreamCartClient";
import { VoucherAvailableItem } from "@/types/voucher/voucher";
import { toast } from "sonner";

function OrderPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [AddressInfo, setAdddressInfo] = useState<Address | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "COD" | "BankTransfer"
  >("COD");
  const [shopNotes, setShopNotes] = useState<{ [shopId: string]: string }>({});
  const [deliveryInfo, setDeliveryInfo] =
    useState<PreviewDeliveriesResponse | null>(null);
  const [selectedVouchersByShop, setSelectedVouchersByShop] = useState<
    Record<string, VoucherAvailableItem | null>
  >({});

  useEffect(() => {
    const allIds = searchParams.getAll("cartItemIds");
    const selectedAddressId = searchParams.get("addressId");
    setCartItemIds(allIds);
    setAddressId(selectedAddressId);
  }, [searchParams]);

  const handleUpdateAddressId = (newId: string) => {
    setAddressId(newId);

    const params = new URLSearchParams(searchParams.toString());

    if (newId) {
      params.set("addressId", newId);
    } else {
      params.delete("addressId");
    }

    router.push(`?${params.toString()}`);
  };
  const [orderProduct, setOrderProduct] = useState<
    PreviewOrder | PreviewOrderLive | null
  >(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        if (cartItemIds.length === 0) return;
        const isLive = !!(searchParams.get("live") ?? searchParams.has("live"));
        if (isLive) {
          const res: PreviewOrderLive = await previewOrderLive(cartItemIds);
          setOrderProduct(res);
        } else {
          const res: PreviewOrder = await previewOrder(cartItemIds);
          setOrderProduct(res);
        }
      } catch (error) {
        console.error("Lỗi khi xem trước đơn hàng:", error);
      }
    };

    fetchPreview();
  }, [cartItemIds, searchParams]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      if (!AddressInfo || !orderProduct) return;

      const data: PreviewDeliveries = {
        fromShops: orderProduct.listCartItem.map((shop) => ({
          fromShopId: shop.shopId,
          items: shop.products.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            weight: item.weight,
            length: item.length,
            width: item.width,
            height: item.height,
          })),
        })),
        toProvince: AddressInfo.city,
        toDistrict: AddressInfo.district,
        toWard: AddressInfo.ward,
      };
      try {
        const res: PreviewDeliveriesResponse = await previewDeliveries(data);
        setDeliveryInfo(res);
        console.log("PreviewDeliveries:", res);
      } catch (error) {
        console.error("Lỗi khi xem trước phí giao hàng:", error);
      }
    };

    fetchDeliveries();
  }, [AddressInfo, orderProduct]);
  const handleOnClickOrder = async () => {
    if (!AddressInfo) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    if (!orderProduct) {
      toast.error("Không có sản phẩm để đặt hàng.");
      return;
    }

    const ordersByShop = orderProduct.listCartItem.map((shop) => {
      const deliveryForShop = deliveryInfo?.serviceResponses?.find(
        (res) => res.shopId === shop.shopId
      );

      return {
        shopId: shop.shopId,
        shippingProviderId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        shippingFee: deliveryForShop?.totalAmount || null,
        expectedDeliveryDay: deliveryForShop?.expectedDeliveryDate || "",
        voucherCode: selectedVouchersByShop[shop.shopId]?.voucher?.code || "",
        customerNotes: shopNotes[shop.shopId] || "",
        items: shop.products.map((item) => ({
          productId: item.productId,
          variantId: item.variantID,
          quantity: item.quantity,
          // unitPrice: item.priceData.currentPrice,
        })),
      };
    });
    const isLive = !!(searchParams.get("live") ?? searchParams.has("live"));
    const liveId = searchParams.get("livestreamId");

    const payload: CreateOrder = {
      paymentMethod: selectedPaymentMethod,
      addressId: AddressInfo.id,
      livestreamId: isLive ? liveId : null,
      createdFromCommentId: null,
      ordersByShop,
    };
    console.log(payload);

    try {
      const res = await createOrder(payload);
      toast.success("Đặt hàng thành công!");

      const orderIds: string[] =
        res?.data?.map((order: Order) => order.id) || [];

      if (orderIds.length === 0) {
        toast.error("Không lấy được mã đơn hàng.");
        return;
      }
      try {
        if (isLive && liveId) {
          await livestreamCartClient.clearCart(liveId);
        } else {
          await deleteCart(cartItemIds);
        }
      } catch (err) {
        console.warn("Không thể xóa giỏ hàng:", err);
      }

      const queryParam = orderIds.join(",");

      if (selectedPaymentMethod === "COD") {
        router.push(`/payment/order/results-success?orders=${queryParam}`);
      } else {
        router.push(`/payment/order?orders=${queryParam}`);
      }
    } catch (err) {
      toast.error("Đặt hàng thất bại!");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col mb-10">
      <div className="bg-white mx-auto w-full shadow flex py-4">
        <div className="w-[70%] mx-auto relative flex items-center ">
          <div className="absolute left-0">
            <Button
              className="bg-white shadow-none text-black hover:bg-white hover:text-black cursor-pointer border-none hover:underline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-1" /> Quay lại giỏ hàng
            </Button>
          </div>

          <div className="mx-auto text-center">
            <h3 className="text-2xl font-semibold">Đặt hàng</h3>
            <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
          </div>
        </div>
      </div>

      <div className="w-[70%] mx-auto space-y-5 mt-5">
        <AddressOrder
          addressId={addressId}
          setAddressId={handleUpdateAddressId}
          onDataChange={setAdddressInfo}
        />
        <ProductsOrder
          orderProduct={orderProduct}
          deliveryInfo={deliveryInfo}
          shopNotes={shopNotes}
          onNoteChange={(shopId, note) => {
            setShopNotes((prev) => ({ ...prev, [shopId]: note }));
          }}
          onVouchersChange={(selected) => setSelectedVouchersByShop(selected)}
        />
        <Card className="rounded-none shadow-none py-0 flex-col gap-0 flex">
          <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-b-1 border-purple-200">
            <CardTitle className="flex items-center text-lg font-semibold mt-2.5 mb-1.5">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center mr-4">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              Phương thức thanh toán
            </CardTitle>
          </CardHeader>

          <CardContent className="my-0 pt-5 ">
            <MethodOrder
              value={selectedPaymentMethod}
              onChange={(value) => setSelectedPaymentMethod(value)}
            />
            <div className="flex w-full justify-end py-8 gap-16 text-gray-600 border-b">
              {(() => {
                const shippingTotal = deliveryInfo?.totalAmount || 0;
                const productsTotal = orderProduct?.totalAmount || 0;
                const vouchersTotal = Object.values(
                  selectedVouchersByShop
                ).reduce((sum, v) => sum + (v?.discountAmount || 0), 0);
                const grandTotal = Math.max(
                  0,
                  productsTotal + shippingTotal - vouchersTotal
                );
                return (
                  <>
                    <div className="space-y-4">
                      <div>Tổng tiền hàng:</div>
                      <div>Tổng phí vận chuyển:</div>
                      <div>Tổng tiền voucher giảm:</div>
                      <div>Tổng thanh toán:</div>
                    </div>
                    <div className="space-y-4 flex  items-end flex-col">
                      <div>
                        <PriceTag value={productsTotal} />
                      </div>
                      <div>
                        +<PriceTag value={shippingTotal} />
                      </div>
                      <div>
                        -<PriceTag value={vouchersTotal} />
                      </div>
                      <div className=" text-rose-500 font-medium text-2xl">
                        <PriceTag value={grandTotal} />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex justify-between my-4 items-center">
              <div className="text-gray-600">
                Nhấn đặt hàng đồng nghĩa với việc bạn đồng ý chính sách của
                chúng tôi
              </div>
              <Button
                onClick={handleOnClickOrder}
                className="bg-[#B0F847] text-black hover:bg-[#B0F847]/80 hover:text-black/80 py-5 px-12 text-base rounded-none cursor-pointer "
              >
                Đặt hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrderPageInner;
