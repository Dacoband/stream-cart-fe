"use client";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock } from "lucide-react";
import InforShop from "./components/InforShop";
import AddressShop from "./components/AddressShop";
function Page() {
  return (
    <div>
      <Card className="mb-5">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-[#B0F847] rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cửa hàng của bạn đang được xét duyệt
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">
                Chúng tôi đang xem xét hồ sơ đăng ký của bạn. Quá trình này
                thường mất 1-2 ngày làm việc.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-3 gap-5">
        <Card className="grid col-span-2">
          <CardContent className="">
            <InforShop />
          </CardContent>
        </Card>
        <Card className="">
          <CardContent className="">
            <AddressShop />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Page;
