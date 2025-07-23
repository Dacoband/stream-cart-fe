"use client";
import { Button } from "@/components/ui/button";
import { withRoleProtection } from "@/lib/requireRole";
import { Plus } from "lucide-react";
import React from "react";

function AddressUser() {
  return (
    <div>
      {" "}
      <div className="flex justify-between border-b pb-4">
        <div>
          <div className="text-xl font-semibold ">Hồ sơ của tôi:</div>
          <span className="text-muted-foreground text-sm ">
            Quản lý địa chỉ giao hàng của bạn
          </span>
        </div>
        <Button className="bg-[#B0F847] hover:bg-[#B0F847]/80 text-black hover:text-black/50 border-2 cursor-pointer ">
          <Plus />
          Thêm địa chỉ mới
        </Button>
      </div>
    </div>
  );
}

export default withRoleProtection(AddressUser, [1]);
