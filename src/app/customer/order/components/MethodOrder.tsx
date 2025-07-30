import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote, Wallet } from "lucide-react";

import React, { useEffect, useState } from "react";
import { previewOrder } from "@/services/api/cart/cart";
import { PreviewOrder } from "@/types/Cart/Cart";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";
interface MethodOrderProps {
  cartItemIds: string[];
}
function MethodOrder({ cartItemIds }: MethodOrderProps) {
  const [orderProduct, setOrderProduct] = useState<PreviewOrder | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        if (cartItemIds.length === 0) return;
        const res: PreviewOrder = await previewOrder(cartItemIds);
        setOrderProduct(res);
      } catch (error) {
        console.error("Lỗi khi xem trước đơn hàng:", error);
      }
    };

    fetchPreview();
  }, [cartItemIds]);
  return (
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
        <div className="border-b pb-5">
          <RadioGroup defaultValue="cod" className="">
            {/* COD Option */}
            <div className="flex items-start gap-4  py-3 rounded-none transition-all data-[state=checked]:border-lime-500 data-[state=checked]:bg-lime-50">
              <RadioGroupItem
                value="cod"
                id="cod"
                className="mt-1 border-black-500 "
              />
              <Label
                htmlFor="cod"
                className="flex items-start gap-4 cursor-pointer w-full"
              >
                <div className="p-2 rounded-md bg-lime-100">
                  <Banknote className="w-6 h-6 text-lime-600" />
                </div>
                <div>
                  <div className="font-semibold text-base text-gray-800">
                    Thanh toán khi nhận hàng
                  </div>
                  <div className="text-sm text-gray-500">
                    Thanh toán sau khi nhận được hàng tại địa chỉ giao.
                  </div>
                </div>
              </Label>
            </div>

            {/* Bank Option */}
            <div className="flex items-start gap-4 py-3 rounded-xl transition-all data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50">
              <RadioGroupItem
                value="bank"
                id="bank"
                className="mt-1 border-black-500 "
              />
              <Label
                htmlFor="bank"
                className="flex items-start gap-4 cursor-pointer w-full"
              >
                <div className="p-2 rounded-md bg-blue-100">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-base text-gray-800">
                    Chuyển khoản ngân hàng
                  </div>
                  <div className="text-sm text-gray-500">
                    Thanh toán qua chuyển khoản ngân hàng trực tuyến.
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex w-full justify-end py-8 gap-16 text-gray-600 border-b">
          <div className="space-y-4">
            <div>Tổng tiền hàng:</div>
            <div>Tổng phí vận chuyển:</div>
            <div>Tổng thanh toán:</div>
          </div>
          <div className="space-y-4 flex  items-end flex-col">
            <div>
              <PriceTag value={100000} />
            </div>
            <div>
              <PriceTag value={100000} />
            </div>
            <div className=" text-rose-500 font-medium text-2xl">
              <PriceTag value={100000} />
            </div>
          </div>
        </div>
        <div className="flex justify-between my-4 items-center">
          <div className="text-gray-600">
            Nhấn đặt hàng đồng nghĩa với việc bạn đồng ý chính sách của chúng
            tôi
          </div>
          <Button className="bg-[#B0F847] text-black py-5 px-12 text-base rounded-none cursor-pointer ">
            Đặt hàng
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default MethodOrder;
