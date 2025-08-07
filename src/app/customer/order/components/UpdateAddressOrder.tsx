"use client";
import { Edit } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { getAddressUser } from "@/services/api/address/address";
import { Address } from "@/types/address/address";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import DialogUpdateAddress from "../../components/DialogUpdateAddress";
import DialogAddNewAddress from "../../components/DialogAddNewAddress";

interface Props {
  beforeAddressId?: string;
  onSuccess?: (selectedId: string) => void;
}

function UpdateAddressOrder({ beforeAddressId, onSuccess }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string>(beforeAddressId ?? "");

  const fetchAddresses = async () => {
    try {
      const res = await getAddressUser();
      setAddresses(res || []);
    } catch {}
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (beforeAddressId) {
      setSelectedId(beforeAddressId);
    }
  }, [beforeAddressId]);

  return (
    <div className="w-full flex justify-center flex-col">
      <Dialog>
        <DialogTrigger className="flex py-1 px-2 w-fit mx-auto items-center cursor-pointer rounded-sm border border-dashed border-lime-600 text-lime-600 hover:border-lime-500 hover:text-lime-500">
          <Edit className="mr-1" size={16} /> Thay đổi
        </DialogTrigger>
        <DialogContent className="p-0 m-0 rounded-sm max-w-xl">
          <DialogHeader className="px-5 py-4 border-b">
            <DialogTitle className="flex justify-between">
              <div className="font-medium text-lg"> Chọn địa chỉ giao hàng</div>
            </DialogTitle>
          </DialogHeader>

          <div className="px-5 h-[48vh] overflow-y-auto">
            {addresses.map((addr) => (
              <div key={addr.id}>
                <RadioGroup value={selectedId} onValueChange={setSelectedId}>
                  <label className="flex py-4  cursor-pointer justify-between gap-4 border-b">
                    <div className="flex gap-2">
                      <RadioGroupItem
                        value={addr.id}
                        className="w-4 h-4 mt-1 border-gray-500"
                      />
                      <div>
                        <p className=" flex mb-2 text-base">
                          <span className="pr-3 border-r border-gray-400 font-medium">
                            {addr.recipientName}
                          </span>
                          <span className="ml-3 text-gray-600">
                            {addr.phoneNumber}
                          </span>
                          {addr.isDefaultShipping && (
                            <span className="text-xs text-lime-600 border border-lime-600 rounded px-2 py-0.5 ml-4">
                              Mặc định
                            </span>
                          )}
                        </p>
                        <p className="text-gray-600 text-base">
                          {addr.street}, {addr.ward}, {addr.district},{" "}
                          {addr.city}, {addr.country}
                        </p>
                      </div>
                    </div>
                    <div className="w-fit text-sm">
                      <DialogUpdateAddress
                        address={addr}
                        onSuccess={fetchAddresses}
                      />
                    </div>
                  </label>
                </RadioGroup>
              </div>
            ))}
            <div className="mt-4 bg-white flex hover:bg-gray-50 gap-2 text-gray-600 hover:text-gray-500 w-fit border ">
              <DialogAddNewAddress onSuccess={fetchAddresses} />
            </div>
          </div>

          <div className="px-5 py-4 border-t flex justify-end gap-2">
            <DialogClose asChild>
              <button className="text-gray-600 hover:text-black px-10 py-2 border cursor-pointer ">
                Hủy
              </button>
            </DialogClose>
            <DialogClose asChild>
              <button
                className="w-44 bg-[#B0F847] hover:bg-[#B0F847]/80  text-black hover:text-black/50 cursor-pointer"
                onClick={() => {
                  if (selectedId && selectedId !== beforeAddressId) {
                    onSuccess?.(selectedId);
                  }
                }}
              >
                Xác nhận
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UpdateAddressOrder;
