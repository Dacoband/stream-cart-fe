import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Store, TicketCheck, Timer } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { addVoucherByShop } from "@/services/api/voucher/voucher";
import { VoucherAvailableItem } from "@/types/voucher/voucher";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Note: Accepting union shapes from cart and livestream; keep prop loosely typed
import Image from "next/image";
import { Separator } from "@radix-ui/react-dropdown-menu";
import PriceTag from "@/components/common/PriceTag";
import { PreviewDeliveriesResponse } from "@/types/deliveries/deliveries";

type ProductItem = {
  cartItemId: string;
  productName: string;
  primaryImage?: string;
  quantity: number;
  attributes?: Record<string, string>;
  priceData: { currentPrice: number; originalPrice: number };
  productId: string;
  variantID?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
};

type ShopItem = {
  shopId: string;
  shopName: string;
  products: ProductItem[];
  totalPriceInShop?: number;
};

type OrderLike = {
  listCartItem: ShopItem[];
};

interface ProductsOrderProps {
  orderProduct: unknown | null;
  shopNotes: { [shopId: string]: string };
  onNoteChange: (shopId: string, note: string) => void;
  deliveryInfo: PreviewDeliveriesResponse | null;
  onVouchersChange?: (
    selected: Record<string, VoucherAvailableItem | null>
  ) => void;
}

function ProductsOrder({
  orderProduct,
  shopNotes,
  onNoteChange,
  deliveryInfo,
  onVouchersChange,
}: ProductsOrderProps) {
  const [vouchersByShop, setVouchersByShop] = useState<
    Record<string, VoucherAvailableItem[]>
  >({});
  const [selectedVoucherByShop, setSelectedVoucherByShop] = useState<
    Record<string, VoucherAvailableItem | null>
  >({});
  const [loadingByShop, setLoadingByShop] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    onVouchersChange?.(selectedVoucherByShop);
  }, [selectedVoucherByShop, onVouchersChange]);

  const asOrder = (obj: unknown): OrderLike | null => {
    if (!obj || typeof obj !== "object") return null;
    const maybe = obj as { listCartItem?: unknown };
    if (Array.isArray(maybe.listCartItem)) {
      return obj as OrderLike;
    }
    return null;
  };

  const order = asOrder(orderProduct);

  const fetchVouchersForShop = async (shopId: string) => {
    if (loadingByShop[shopId]) return;
    setLoadingByShop((s) => ({ ...s, [shopId]: true }));

    try {
      const shop = order?.listCartItem.find((s) => s.shopId === shopId);
      // Fallback: if totalPriceInShop not provided, derive from items
      const fallbackTotal = (shop?.products || []).reduce(
        (sum, p) => sum + p.quantity * (p.priceData?.currentPrice || 0),
        0
      );
      const totalPriceInShop = shop?.totalPriceInShop ?? fallbackTotal;

      const res: VoucherAvailableItem[] = await addVoucherByShop({
        orderAmount: totalPriceInShop,
        shopId,
        sortByDiscountDesc: true,
      });

      setVouchersByShop((s) => ({ ...s, [shopId]: res || [] }));

      setSelectedVoucherByShop((s) => {
        const current = s[shopId];
        if (!current) return s;
        const exists = (res || []).some(
          (i) => i.voucher.id === current.voucher?.id
        );
        return exists ? s : { ...s, [shopId]: null };
      });
    } catch {
    } finally {
      setLoadingByShop((s) => ({ ...s, [shopId]: false }));
    }
  };

  return (
    <Card className="rounded-none shadow-none py-0 flex-col gap-0 flex">
      <CardHeader className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-b-1 border-blue-200">
        <CardTitle
          className=" text-lg  mt-2.5 mb-1.5 rounded-none shadow-none grid items-center "
          style={{ gridTemplateColumns: " 6fr 2fr 2fr 2fr" }}
        >
          <div className="text-left font-semibold flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-md flex items-center justify-center mr-4">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            Sản phẩm
          </div>
          <div className="text-center font-normal text-base ">Đơn Giá</div>
          <div className="text-center font-normal text-base ">Số Lượng</div>
          <div className="text-center font-normal text-base ">Số Tiền</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="my-0 space-y-4">
        {order?.listCartItem.map((shop: ShopItem) => (
          <div
            className="rounded-none shadow-none pb-5 pt-0 items-center  my-3 px-0"
            key={shop.shopId}
          >
            <div className=" grid  w-full items-center my-5 ">
              <div className="flex gap-2 items-center w-full">
                <div className="text-orange-600">
                  <Store size={18} />
                </div>
                <span className=" font-medium  text-black/80 w-full">
                  {shop.shopName}
                </span>
              </div>
            </div>
            <Separator />
            {shop.products.map((product: ProductItem) => (
              <div className="flex-col" key={product.cartItemId}>
                <div
                  className="rounded-none shadow-none grid items-center w-full mb-5 py-0 "
                  style={{ gridTemplateColumns: " 6fr 2fr 2fr 2fr " }}
                >
                  <div className="text-left gap-2 flex">
                    <Image
                      src={product.primaryImage || "/placeholder.svg"}
                      alt={product.productName}
                      width={70}
                      height={75}
                      className="rounded-none h-[75px] w-[70px] object-cover border"
                    />
                    <div className="flex-1 mr-5 mb-2  line-clamp-2 min-h-[48px]">
                      {product.productName}
                    </div>
                    <div className="w-40 text-black/60">
                      {product.attributes &&
                        Object.keys(product.attributes).length > 0 && (
                          <div className="text-sm text-gray-600">
                            <div className="text-gray-800 mb-2 font-medium">
                              Phân loại:
                            </div>
                            <span>
                              {Object.entries(product.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="text-center ">
                    <div className="flex gap-4 justify-center items-center">
                      <span className="font-medium">
                        <PriceTag value={product.priceData.currentPrice} />
                      </span>

                      <span
                        className={`font-medium ${
                          product.priceData.originalPrice >
                          product.priceData.currentPrice
                            ? "line-through text-gray-600"
                            : ""
                        }`}
                      >
                        <PriceTag value={product.priceData.originalPrice} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-center flex gap-2 items-center justify-center">
                      <div className="w-8">{product.quantity}</div>
                    </div>
                  </div>
                  <div className="text-center text-rose-500 font-medium ">
                    <PriceTag
                      value={product.quantity * product.priceData.currentPrice}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className=" p-4 mt-2 flex  text-orange-500 items-center justify-between">
              <div className="flex gap-2">
                <TicketCheck />
                Voucher của cửa hàng
              </div>
              <div>
                <Popover
                  onOpenChange={(open) =>
                    open && fetchVouchersForShop(shop.shopId)
                  }
                >
                  <PopoverTrigger className="text-blue-700">
                    {selectedVoucherByShop[shop.shopId]?.voucher?.code ? (
                      <div className="flex gap-5">
                        <span className="text-orange-500">
                          Giảm: -
                          <PriceTag
                            value={
                              selectedVoucherByShop[shop.shopId]
                                ?.discountAmount || 0
                            }
                          />
                        </span>
                        <span>
                          Voucher:{" "}
                          {selectedVoucherByShop[shop.shopId]?.voucher?.code}
                        </span>
                      </div>
                    ) : (
                      <span>Chọn voucher</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px]">
                    <DropdownMenuLabel className="text-gray-800 text-center mx-auto text-base border-b mb-2">
                      Voucher của {shop.shopName}
                    </DropdownMenuLabel>

                    {loadingByShop[shop.shopId] && (
                      <div className="p-3 text-sm text-gray-500">
                        Đang tải voucher…
                      </div>
                    )}

                    {!loadingByShop[shop.shopId] && (
                      <div className="max-h-[400px] overflow-auto px-1 my-2.5">
                        {vouchersByShop[shop.shopId]?.length ? (
                          <RadioGroup
                            value={
                              selectedVoucherByShop[shop.shopId]?.voucher?.id ||
                              ""
                            }
                            onValueChange={(val) => {
                              const picked =
                                vouchersByShop[shop.shopId].find(
                                  (i) => i.voucher.id === val
                                ) || null;
                              setSelectedVoucherByShop((s) => ({
                                ...s,
                                [shop.shopId]: picked,
                              }));
                            }}
                            className="space-y-1"
                          >
                            {vouchersByShop[shop.shopId].map((item) => (
                              <label
                                key={item.voucher.id}
                                className="flex items-stretch gap-2 p-3 border rounded-none bg-white shadow-sm cursor-pointer  transition"
                              >
                                {/* Logo shop */}
                                <div className=" w-18 overflow-hidden flex items-center justify-center shrink-0">
                                  {item.voucher.shopImageUrl ? (
                                    <div className="w-16 h-16 rounded-full overflow-hidden">
                                      <Image
                                        src={item.voucher.shopImageUrl}
                                        alt={item.voucher.shopName}
                                        width={64}
                                        height={64}
                                        quality={100}
                                        unoptimized
                                        className="object-cover w-full h-full rounded-full"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden"></div>
                                  )}
                                </div>
                                {/* Nội dung */}
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    {/* Header: Code + loại voucher */}
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-800 text-sm">
                                        {item.voucher.code}
                                      </span>

                                      <span className="text-[11px] px-1.5 py-0.5 rounded text-white bg-orange-400">
                                        {item.voucher.type === 1 && (
                                          <>Giảm {item.voucher.value}%</>
                                        )}
                                        {item.voucher.type === 2 && (
                                          <>
                                            Giảm{" "}
                                            <PriceTag
                                              value={item.voucher.value}
                                            />
                                          </>
                                        )}
                                        {item.voucher.type !== 1 &&
                                          item.voucher.type !== 2 && (
                                            <>{item.voucher.typeDisplayName}</>
                                          )}
                                      </span>
                                    </div>

                                    {/* Mô tả voucher */}
                                    <p className="text-sm text-gray-700 mt-1">
                                      {item.voucher.description}
                                    </p>

                                    {/* Điều kiện áp dụng */}
                                    <div className="flex flex-wrap gap-3 mt-1 text-[12px] text-gray-600">
                                      <span>
                                        Đơn tối thiểu:{" "}
                                        <PriceTag
                                          value={
                                            item.voucher.minOrderAmount || 0
                                          }
                                        />
                                      </span>

                                      <span>
                                        HSD:{" "}
                                        {new Date(
                                          String(item.voucher.endDate)
                                        ).toLocaleDateString("vi-VN")}
                                      </span>
                                    </div>

                                    {/* Badge gợi ý */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {item.voucher.isExpiringSoon && (
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-600 font-medium">
                                          Sắp hết hạn
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>{" "}
                                <RadioGroupItem
                                  value={item.voucher.id}
                                  className=" m-auto"
                                />
                              </label>
                            ))}
                          </RadioGroup>
                        ) : (
                          <div className="p-3 text-sm text-gray-500">
                            Không có voucher khả dụng
                          </div>
                        )}
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <div className="p-3 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        {selectedVoucherByShop[shop.shopId] ? (
                          <div className="flex items-center gap-2">
                            {/* <span className="text-gray-600">Ưu đãi:</span>
                            <span className="font-medium text-rose-600">
                              -
                              <PriceTag
                                value={
                                  selectedVoucherByShop[shop.shopId]
                                    ?.discountAmount || 0
                                }
                              />
                            </span> */}
                            <span className="font-medium text-rose-600">
                              {selectedVoucherByShop[shop.shopId]
                                ?.discountMessage || ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            Chưa chọn voucher
                          </span>
                        )}
                      </div>
                      {selectedVoucherByShop[shop.shopId] && (
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-gray-600 border-gray-400 cursor-pointer rounded-none"
                          onClick={() =>
                            setSelectedVoucherByShop((s) => ({
                              ...s,
                              [shop.shopId]: null,
                            }))
                          }
                        >
                          Bỏ chọn
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="bg-blue-50/50 border-t border-b border-blue-100 p-4 flex items-center justify-between">
              <div className="w-1/2 pr-5 border-r border-blue-100">
                <label className="block text-sm text-gray-600 font-medium mb-1">
                  Lời nhắn:
                </label>
                <input
                  type="text"
                  value={shopNotes[shop.shopId] || ""}
                  onChange={(e) => onNoteChange(shop.shopId, e.target.value)}
                  placeholder="Lưu ý cho Người bán..."
                  className="w-full border px-3 py-2 text-sm focus:outline-none focus:ring bg-white rounded-none"
                />
              </div>
              {(() => {
                const deliveryForShop = deliveryInfo?.serviceResponses?.find(
                  (res) => res.shopId === shop.shopId
                );
                return (
                  <div className="flex-1 w-full text-sm text-gray-700 pl-5">
                    <div className="flex flex-col justify-between items-start">
                      <div className="flex justify-between w-full items-center">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2 items-center">
                            <span className="font-medium">
                              Phương thức vận chuyển:
                            </span>
                            <span className="ml-1 font-semibold flex gap-1 text-teal-600 items-center">
                              <Package size={16} /> Giao hàng nhanh
                            </span>
                          </div>
                          <div className="text-sm mt-0.5 flex gap-1 text-teal-600">
                            <Timer size={18} /> Thời gian dự kiến:{" "}
                            <span className="font-medium">
                              {deliveryForShop?.expectedDeliveryDate
                                ? new Date(
                                    deliveryForShop.expectedDeliveryDate
                                  ).toLocaleDateString("vi-VN")
                                : "Vui lòng nhập địa chỉ"}
                            </span>
                          </div>
                        </div>
                        <div className="text-teal-600 font-semibold text-base whitespace-nowrap">
                          +
                          <PriceTag value={deliveryForShop?.totalAmount || 0} />
                        </div>
                      </div>
                      <div className="text-gray-400 mt-2 text-sm">
                        Lưu ý: Sử dụng địa chỉ mua hàng trước sáp nhập
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default ProductsOrder;
