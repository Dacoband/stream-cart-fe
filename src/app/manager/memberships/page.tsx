"use client";
import React, { useCallback, useEffect, useState } from "react";
import { TableMemberShip } from "./components/TableMembership";
import { Membership } from "@/types/membership/membership";
import { getMembership } from "@/services/api/membership/membership";
import { Button } from "@/components/ui/button";
import DialogUpdateMemberShip from "./components/DialogUpdateMemberShip";
import { CirclePlus } from "lucide-react";
function MembershipPage() {
  const [membership, setMembership] = useState<
    Membership[] | { memberships?: Membership[]; totalItems?: number }
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create");
  const [selected, setSelected] = useState<Membership | null>(null);
  const fetchMembership = useCallback(async () => {
    try {
      const response = await getMembership();
      setMembership(response);
    } catch (error) {
      console.error("Fetch Error List Memberships:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div className="">
          <h2 className="text-xl font-bold">Quản lý gói thanh viên</h2>
        </div>
        <Button
          onClick={() => {
            setDialogMode("create");
            setSelected(null);
            setDialogOpen(true);
          }}
          className="bg-[#B0F847] text-black shadow flex gap-2   py-3 font-medium px-4 rounded-md h-fit  items-center cursor-pointer hover:bg-[#B0F847]/80 hover:text-black/80"
        >
          <CirclePlus size={18} /> Tạo gói mới
        </Button>
      </div>
      <div className="mx-5 mb-10">
        <TableMemberShip
          membership={membership}
          loading={loading}
          fetchMembership={fetchMembership}
          onEdit={(m) => {
            setDialogMode("update");
            setSelected(m);
            setDialogOpen(true);
          }}
        />
      </div>

      <DialogUpdateMemberShip
        open={dialogOpen}
        mode={dialogMode}
        initial={selected}
        onOpenChange={setDialogOpen}
        onSuccess={fetchMembership}
      />
    </div>
  );
}

export default MembershipPage;
