"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { withRoleProtection } from "@/lib/requireRole";
import React, { useEffect, useState } from "react";
import {
  getAddressUser,
  deleteAddressById,
  updateDefaultShippingById,
} from "@/services/api/address/address";
import { Address } from "@/types/address/address";
import DialogAddNewAddress from "../../components/DialogAddNewAddress";
import DialogAddress from "../../order/components/DialogFirstAddress";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertDialogCancel,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
function AddressUser() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchAddresses = async () => {
    try {
      const reponse = await getAddressUser();
      setAddresses(reponse || []);
    } catch (error) {
      console.error("Fetch Error Address:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);
  const handleDeleteAddress = async (deleteId: string) => {
    setLoadingDelete(true);
    try {
      await deleteAddressById(deleteId);

      fetchAddresses();
      toast.success("Xóa địa chỉ thành công!");
    } catch (error) {
      console.error("Fetch Error delete Address:", error);
      toast.error("Xóa địa chỉ thất bại!");
    } finally {
      setLoadingDelete(false);
      setDeleteId(null);
    }
  };
  const handleUpdateDefaultShipping = async (defaultShippingId: string) => {
    try {
      await updateDefaultShippingById(defaultShippingId);

      fetchAddresses();
      toast.success("Cập nhật địa chỉ thành công!");
    } catch (error) {
      console.error("Fetch update default shipping error:", error);
      toast.error("Cập nhật dịa chỉ thành công!");
    } finally {
      setLoadingDelete(false);
      setDeleteId(null);
    }
  };
  return (
    <div className="flex flex-col w-full h-full overflow-auto ">
      <div className="flex justify-between items-center border-b pb-4 mb-5">
        <div>
          <div className="text-xl font-semibold">Địa chỉ của bạn:</div>
          <span className="text-muted-foreground text-sm">
            Quản lý địa chỉ giao hàng của bạn
          </span>
        </div>
        {loading ? (
          <div className="space-y-4 mt-4">
            {[1, 2, 3].map((_, index) => (
              <Skeleton key={index} className="w-full h-20 rounded" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div></div>
        ) : (
          <DialogAddNewAddress onSuccess={fetchAddresses} />
        )}
      </div>

      {loading ? (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map((_, index) => (
            <Skeleton key={index} className="w-full h-20 rounded" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="w-full h-full  flex-1 flex justify-center items-center mt-24">
          <DialogAddress onSuccess={fetchAddresses} />
        </div>
      ) : (
        [...addresses]
          .sort(
            (a, b) =>
              (b.isDefaultShipping ? 1 : 0) - (a.isDefaultShipping ? 1 : 0)
          )
          .map((addr) => (
            <div key={addr.id} className="">
              <div className="flex py-3.5  items-center justify-between gap-4 border-b ">
                <div className="flex flex-col text-sm text-gray-800">
                  <p className="font-medium flex mb-2">
                    <span className="pr-3 border-r border-gray-400">
                      {addr.recipientName}
                    </span>
                    <span className="ml-3">{addr.phoneNumber}</span>
                  </p>
                  <p className="text-gray-600">
                    {addr.street}, {addr.ward}, {addr.district}, {addr.city},{" "}
                    {addr.country}
                  </p>
                  {addr.isDefaultShipping && (
                    <div className="text-xs text-lime-600 border border-lime-600 rounded-none px-1 py-0.5 w-fit mt-2">
                      Địa chỉ mặc định
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-4 text-sm">
                    <AlertDialog
                      open={deleteId === addr.id}
                      onOpenChange={(open) => !open && setDeleteId(null)}
                    >
                      <AlertDialogTrigger asChild>
                        <button
                          disabled={addr.isDefaultShipping}
                          className={`
    ${addr.isDefaultShipping ? "hidden" : "text-red-600 hover:underline"}
  `}
                          onClick={() => setDeleteId(addr.id)}
                        >
                          Xóa
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Xác nhận xóa đại chỉ
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa địa chỉ {addr.street},{" "}
                            {addr.ward}, {addr.district}, {addr.city},{" "}
                            {addr.country} ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-5">
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={loadingDelete}
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <button
                    onClick={() => handleUpdateDefaultShipping(addr.id)}
                    disabled={addr.isDefaultShipping}
                    className={`border border-gray-400 text-sm px-3 py-1 rounded 
    ${
      addr.isDefaultShipping
        ? "text-gray-400 cursor-not-allowed"
        : "hover:bg-gray-100"
    }
  `}
                  >
                    {addr.isDefaultShipping ? "Mặc định" : "Thiết lập mặc định"}
                  </button>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  );
}

export default withRoleProtection(AddressUser, [1]);
