"use client";
import Lottie from "lottie-react";
import successAnimation from "../../../../../public/animations/PaymentSuccess.json";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { withRoleProtection } from "@/lib/requireRole";

const PaymentSuccess = () => {
  return (
    <Card className="w-[60vw]  py-14  gap-0 flex items-center ">
      <CardContent className="w-[65%] flex justify-center flex-col items-center mx-auto">
        <div className="h-36 mx-auto">
          <Lottie
            animationData={successAnimation}
            loop={false}
            autoplay={true}
            className="w-36"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được đặt thành công.
        </p>
        <div className="bg-gray-100 rounded-lg p-4 mb-10 text-left w-full">
          <div className="flex justify-between items-center mb-2.5">
            <span className=" text-gray-600">Mã đơn hàng:</span>
            <span className="font-medium">#SC-2024-001</span>
          </div>
          {/* <div className="flex justify-between items-center mb-2.5">
            <span className=" text-gray-600">Tổng tiền:</span>
            <span className=" font-medium">1.299.000 VNĐ</span>
          </div> */}
          <div className="flex justify-between items-center">
            <span className=" text-gray-600">Thanh toán:</span>
            <span className=" font-medium">Chờ thanh toán</span>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-5 w-full mb-5">
          <Button className="w-full bg-[#B0F847] hover:bg-[#B0F847]/80 text-black hover:text-black/80 cursor-pointer rounded-none py-5">
            <Link href="/ " className="flex">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Tiếp tục mua sắm
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent  text-black hover:text-black/80 cursor-pointer rounded-none py-5"
            asChild
          >
            <Link href="/customer/manage-orders">Xem đơn hàng của tôi</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default withRoleProtection(PaymentSuccess, [1]);
