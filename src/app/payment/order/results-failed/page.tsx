"use client";
import Lottie from "lottie-react";
import FailAnimation from "../../../../../public/animations/PaymentFailed.json";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import Link from "next/link";
import { withRoleProtection } from "@/lib/requireRole";

interface LottieAnimationProps {
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

const PaymentFailed: React.FC<LottieAnimationProps> = ({
  loop = false,
  autoplay = true,
  className = "w-60",
}) => {
  return (
    <Card className="w-[60vw]  py-8  gap-0 flex items-center ">
      <CardContent className="w-[65%] flex justify-center flex-col items-center mx-auto gap-0">
        <div className="h-60 mx-auto -mt-8">
          <Lottie
            animationData={FailAnimation}
            loop={loop}
            autoplay={autoplay}
            className={className}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 -mt-10 ">
          Thanh toán thất bại!
        </h1>
        <p className="text-gray-600 mb-10 text-center">
          Rất tiếc đơn hàng của bạn thanh toán không thành công, vui lòng kiểm
          tra lại thông tin thanh toán hoặc thử lại sau.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-5 w-full mb-5">
          <Button className="w-full bg-rose-600 hover:bg-rose-600/90 text-white  cursor-pointer rounded-none py-5">
            <Link href="/ " className="flex gap-2 items-center">
              <Repeat /> Thanh toán lại
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

export default withRoleProtection(PaymentFailed, [1]);
