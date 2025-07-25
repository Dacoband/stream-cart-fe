"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddressOrder from "./components/AddressOrder";
import ProductsOrder from "./components/ProductsOrder";
import MethodOrder from "./components/MethodOrder";
export default function OrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cartItemIds, setCartItemIds] = useState<string[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col mb-10">
      <div className="bg-white mx-auto w-full shadow flex py-3">
        <div className="w-[70%] mx-auto relative flex items-center h-[70px]">
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
        />
        <ProductsOrder cartItemIds={cartItemIds} />
        <MethodOrder cartItemIds={cartItemIds} />
      </div>
    </div>
  );
}
