"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import React from "react";
import { Wallet, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { getWalletShopId } from "@/services/api/wallet/wallet";
import { WalletDTO } from "@/types/wallet/wallet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableOrder from "./components/tableOrder";
import TableTransaction from "./components/tableTransaction";
function Page() {
  const { user } = useAuth();
  const [wallet, setWallet] = React.useState<WalletDTO | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const formatVND = (n?: number) =>
    typeof n === "number"
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(n)
      : "—";

  React.useEffect(() => {
    const run = async () => {
      if (!user?.shopId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await getWalletShopId(user.shopId);
        const data: WalletDTO | null = res && res.id ? res : res?.data ?? null;
        setWallet(data ?? null);
      } catch (e) {
        console.error(e);
        setError("Không thể tải thông tin ví");
        setWallet(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.shopId]);

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <h2 className="text-xl font-bold">Quản lý giao dịch</h2>
      </div>

      <div className="mx-5 mb-10">
        <Card className="bg-white py-5 px-8 min-h-[75vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet summary */}
            <Card className="bg-gradient-to-br p-0 from-blue-50 to-white shadow-none rounded-lg border">
              <CardContent className="flex items-center gap-5 p-6">
                {/* Icon */}
                <div className="p-3 bg-blue-100 rounded-full shrink-0">
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
                {/* Nội dung */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-700">Ví của tôi</CardTitle>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      Yêu cầu rút
                    </Button>
                  </div>
                  <div className="mt-2">
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-56" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    ) : error ? (
                      <p className="text-red-600">{error}</p>
                    ) : (
                      <p className="font-medium text-blue-800">
                        Số dư: {formatVND(wallet?.balance)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank account */}
            <Card className="bg-gradient-to-br from-green-50 p-0 to-white shadow-none rounded-lg border">
              <CardContent className="flex items-center gap-5 p-6">
                {/* Icon */}
                <div className="p-3 bg-green-100 rounded-full shrink-0">
                  <Banknote className="h-8 w-8 text-green-600" />
                </div>
                {/* Nội dung */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-green-700">
                      Tài khoản: {wallet?.bankName || "Chưa cập nhật"}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700 cursor-pointer"
                    >
                      Cập nhật
                    </Button>
                  </div>
                  <div className="mt-2">
                    {loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-56" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    ) : error ? (
                      <p className="text-red-600">{error}</p>
                    ) : (
                      <p className="font-medium text-green-800">
                        Số tài khoản:{" "}
                        {wallet?.bankAccountNumber || "Chưa cập nhật"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-5">
            <Tabs defaultValue="orders">
              <TabsList className="rounded-none bg-gray-200 border">
                <TabsTrigger
                  value="orders"
                  className="rounded-none p-4 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
                >
                  Thu nhập đơn hàng
                </TabsTrigger>

                <TabsTrigger
                  value="withdrawals"
                  className="rounded-none p-4 data-[state=active]:bg-[#B0F847]/50 data-[state=active]:text-black"
                >
                  Yêu cầu rút tiền
                </TabsTrigger>
              </TabsList>
              <div className="mt-4" />
              <TabsContent value="orders">
                <TableOrder />
              </TabsContent>
              <TabsContent value="withdrawals">
                <TableTransaction />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Page;
