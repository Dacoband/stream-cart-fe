import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote } from "lucide-react";

import React from "react";

interface MethodOrderProps {
  value: "COD" | "BankTransfer";
  onChange: (value: "COD" | "BankTransfer") => void;
}

function MethodOrder({ value, onChange }: MethodOrderProps) {
  return (
    <div className="border-b pb-5">
      <RadioGroup value={value} onValueChange={onChange}>
        {/* COD Option */}
        <div className="flex items-start gap-4 py-3 rounded-none transition-all data-[state=checked]:border-lime-500 data-[state=checked]:bg-lime-50">
          <RadioGroupItem
            value="COD"
            id="COD"
            className="mt-1 border-black-500"
          />
          <Label
            htmlFor="COD"
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
            value="BankTransfer"
            id="BankTransfer"
            className="mt-1 border-black-500"
          />
          <Label
            htmlFor="BankTransfer"
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
  );
}

export default MethodOrder;
