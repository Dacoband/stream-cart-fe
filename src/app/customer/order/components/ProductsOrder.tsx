import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Store, Timer } from "lucide-react";
import React from "react";

import { PreviewOrder } from "@/types/Cart/Cart";
import Image from "next/image";
import { Separator } from "@radix-ui/react-dropdown-menu";
import PriceTag from "@/components/common/PriceTag";

interface ProductsOrderProps {
  orderProduct: PreviewOrder | null;
  shopNotes: { [shopId: string]: string };
  onNoteChange: (shopId: string, note: string) => void;
}

function ProductsOrder({
  orderProduct,
  shopNotes,
  onNoteChange,
}: ProductsOrderProps) {
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
        {orderProduct?.listCartItem.map((shop) => (
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
            {shop.products.map((product) => (
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
                      <span className="font-medium ">
                        <PriceTag value={product.priceData.currentPrice} />
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
                      value={product.quantity * product.priceData.originalPrice}
                    />
                  </div>
                </div>
              </div>
            ))}
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

              {/* Thông tin vận chuyển */}
              <div className="flex-1 text-sm text-gray-700 pl-5">
                <div className="flex flex-col justify-between items-start">
                  <div className="flex justify-between w-full items-center">
                    {/* Trái: Phương thức và thời gian */}
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2 items-center">
                        <span className="font-medium">
                          Phương thức vận chuyển:
                        </span>
                        <span className="ml-1 font-semibold flex gap-1 text-teal-600 items-center">
                          <Package size={16} /> Giao hàng nhanh
                        </span>
                      </div>
                      <div className=" text-sm mt-0.5 flex gap-1 text-teal-600">
                        <Timer size={18} /> Thời gian dự kiến:{" "}
                        <span className="font-medium">3 - 5 ngày</span>
                      </div>
                    </div>

                    {/* Phải: Giá tiền */}
                    <div className="text-teal-600 font-semibold text-base whitespace-nowrap">
                      +12.000đ
                    </div>
                  </div>

                  <div className="text-gray-400 mt-2 text-sm">
                    Lưu ý: Sử dụng địa chỉ mua hàng trước sáp nhập
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default ProductsOrder;
