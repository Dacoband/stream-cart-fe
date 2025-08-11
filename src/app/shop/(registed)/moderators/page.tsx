"use client";
import React, { useCallback, useEffect, useState } from "react";

import { TableModerator } from "./components/TableModerator";
import { getModeratorsByShop } from "@/services/api/auth/moderator";
import { Moderator } from "@/types/auth/user";

import { useAuth } from "@/lib/AuthContext";
import DialogCreateModerator from "./components/DialogCreateModerator";
function ModeratorsPage() {
  const { user } = useAuth();
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [openDialog, setOpenDialog] = useState(false);
  const fetchModerators = useCallback(async () => {
    try {
      if (!user?.shopId) return;
      const response = await getModeratorsByShop(user.shopId);
      setModerators(response);
    } catch (error) {
      console.error("Fetch Error List Moderators:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.shopId]); // chỉ phụ thuộc shopId

  useEffect(() => {
    fetchModerators();
  }, [fetchModerators]);
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div className="">
          <h2 className="text-xl font-bold">
            Danh sách nhân viên cửa hàng nhân viên
          </h2>
        </div>
        <DialogCreateModerator onSuccess={fetchModerators} />
      </div>
      <div className="mx-5 mb-10">
        <TableModerator
          moderators={moderators}
          loading={loading}
          fetchModerators={fetchModerators}
        />
      </div>
    </div>
  );
}

export default ModeratorsPage;
