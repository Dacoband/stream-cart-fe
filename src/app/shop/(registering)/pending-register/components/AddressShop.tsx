"use client";
import {
  CirclePlus,
  Loader2,
  MapPin,
  MapPinX,
  Phone,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { getAddressByShopId } from "@/services/api/address/address";
import { Address } from "@/types/address/address";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

function AddressShop() {
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [loadingbt, setLoadingbt] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAddress = async () => {
      if (!user?.shopId) return;
      try {
        const response = await getAddressByShopId(user.shopId);
        if (response && response.length > 0) {
          setAddress(response[0]);
        }
      } catch (err) {
        console.error("Error loading user address info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [user?.shopId]);

  if (loading) {
    return <Skeleton className="w-full h-40" />;
  }

  const handleClick = () => {
    setLoadingbt(true);

    router.push("/shop/registerAddress");
  };
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-5 flex gap-1.5 items-center">
        <MapPin size={20} /> Địa chỉ cửa hàng:
      </h3>
      <Separator className="mb-5" />

      <h4 className="font-semibold text-gray-900 mb-3">
        Thông tin chủ của hàng:
      </h4>
      <div className="space-y-3">
        <div className="flex  space-x-3">
          <div className="w-10 bg-[#B0F847] flex justify-center items-center rounded-md">
            <User size={20} className="text-black" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Tên người giao hàng
            </label>
            <p className="font-semibold">{user?.username}</p>
          </div>
        </div>
        <div className="flex  space-x-3">
          <div className="w-10 bg-[#B0F847] flex justify-center items-center rounded-md">
            <Phone size={20} className="text-black" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Số điện thoại
            </label>
            <p className="font-semibold">{user?.phoneNumber}</p>
          </div>
        </div>
      </div>

      <Separator className="my-5" />
      {!address ? (
        <div className="flex flex-col items-start gap-4 ">
          <h4 className="font-semibold text-gray-900 mb-5">
            Thông tin người giao hàng:
          </h4>
          <div className="flex flex-col items-center justify-center w-full space-y-4">
            <div className="text-gray-400 flex flex-col items-center gap-2">
              <MapPinX size={55} />
              <p>Chưa đăng ký địa chỉ giao hàng</p>
            </div>

            <Button
              className="bg-[#B0F847] text-black shadow flex gap-2 py-5 w-full text-sm cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80"
              onClick={handleClick}
            >
              {loadingbt ? (
                <span className="flex">
                  <Loader2 className="animate-spin mr-2" />
                  Thêm địa chỉ
                </span>
              ) : (
                <>
                  <CirclePlus />
                  Thêm địa chỉ
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Thông tin người giao hàng:
          </h4>
          <div className="space-y-3">
            <div className="flex  space-x-3">
              <div className="w-10 bg-[#B0F847] flex justify-center items-center rounded-md">
                <User size={20} className="text-black" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tên người giao hàng
                </label>
                <p className="font-semibold">{address.recipientName}</p>
              </div>
            </div>
            <div className="flex  space-x-3">
              <div className="w-10 bg-[#B0F847] flex justify-center items-center rounded-md">
                <Phone size={20} className="text-black" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Số điện thoại
                </label>
                <p className="font-semibold">{address.phoneNumber}</p>
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <h4 className="font-semibold text-gray-900 mb-2">
            Địa chỉ giao hàng
          </h4>
          <div className="bg-blue-50 p-3 rounded-lg border-blue-300 border">
            <div className="flex items-start space-x-2  text-blue-600">
              <MapPin className="w-4 h-4  mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">{address.street},</p>
                <p className="text-gray-600">
                  {address.ward}, {address.district}
                </p>
                <p className="text-gray-600">
                  {address.city}, {address.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressShop;
