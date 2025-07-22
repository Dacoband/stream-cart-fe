"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getAddressById } from "@/services/api/address/address";
import { Address } from "@/types/address/address";
import { Skeleton } from "@/components/ui/skeleton";
import DialogAddress from "./DialogFirstAddress";
import UpdateAddressOrder from "./UpdateAddressOrder";

interface Props {
  addressId?: string | null;
  setAddressId?: (id: string) => void;
  beforeAddressId?: string;
  onSuccess?: (newId: string) => void;
}

function AddressOrder({ addressId, setAddressId }: Props) {
  const [address, SetAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAddress = async () => {
      if (!addressId) {
        SetAddress(null);
        setLoading(false);
        return;
      }
      try {
        const res = await getAddressById(addressId);
        SetAddress(res);
        console.log("Fetch address success", res);
      } catch (err) {
        console.error("Fetch error api address", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, [addressId]);

  return (
    <Card className="rounded-none shadow-none py-0 flex-col gap-0 flex">
      <CardHeader className="bg-[#B0F847]/10 border-b-1 border-[#B0F847]/80 ">
        <CardTitle className="flex items-center text-lg font-semibold  mt-2.5 mb-1.5">
          <div className="w-10 h-10 bg-gradient-to-br from-[#a5e940] to-lime-500 rounded-md flex items-center justify-center mr-4">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          Địa chỉ nhận hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="my-0 py-5">
        {loading ? (
          <div className="flex gap-5 w-full h-fit">
            <div className="w-[30%] ">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="w-[70%]">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ) : !address ? (
          <div className="flex">
            <DialogAddress
              onSuccess={(newId) => {
                setAddressId?.(newId);
              }}
            />
          </div>
        ) : (
          <div className="flex gap-5 w-full h-fit">
            <div className="w-[30%] ">
              <div className="mb-2">
                <span className="font-medium text-gray-500 mr-2">
                  Người nhận:
                </span>{" "}
                <span className="font-medium text-gray-800 mr-2">
                  {address.recipientName}
                </span>
              </div>
              <div>
                {" "}
                <span className="font-medium text-gray-500 mr-2">
                  Số điện thoại:
                </span>{" "}
                <span className="font-medium text-gray-800 mr-2">
                  {address.phoneNumber}
                </span>
              </div>
            </div>
            <div className="w-[60%] ">
              <div className="font-medium text-gray-500 mr-2">Địa chỉ:</div>
              <div className="font-medium text-gray-800">
                <span>
                  {address.street}, {address.ward}, {address.district},{" "}
                  {address.city},{address.country}
                </span>
                {address.isDefaultShipping && (
                  <span className="text-xs text-lime-600 border border-lime-600 rounded px-2 py-0.5 ml-4">
                    Mặc định
                  </span>
                )}
              </div>
            </div>
            <div className="w-[10%] flex justify-center items-center">
              <UpdateAddressOrder
                beforeAddressId={address?.id}
                onSuccess={(newId) => {
                  setAddressId?.(newId);
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AddressOrder;
