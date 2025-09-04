"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

import {
  createWalletTransaction,
  filterWalletTransactions,
} from "@/services/api/wallet/walletTransaction";
import {
  WalletTransactionType,
  WalletTransactionDTO,
  WalletTransactionStatus,
} from "@/types/wallet/walletTransactionDTO";
import { createWithdrawalApproval } from "@/services/api/payment/payment";
import { WithdrawalApprovalResponse } from "@/types/payment/payment";

type TxStatus = "PENDING" | "SUCCESS" | "FAILED";

export default function WithdrawPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<TxStatus>("PENDING");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [approval, setApproval] = useState<WithdrawalApprovalResponse | null>(
    null
  );

  const amountParam = searchParams.get("amount");
  const amount = useMemo(() => {
    const v = Number(amountParam);
    return Number.isFinite(v) ? v : NaN;
  }, [amountParam]);

  // 1) Tạo wallet transaction + approval -> QR
  useEffect(() => {
    if (!amountParam) {
      setError("Thiếu số tiền rút.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Số tiền rút không hợp lệ.");
      return;
    }
    if (!user?.shopId) {
      setError("Thiếu ShopId.");
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        setStatus("PENDING");

        const tx: WalletTransactionDTO = await createWalletTransaction({
          type: WalletTransactionType.Withdraw,
          amount,
        });

        const appr = await createWithdrawalApproval({
          walletTransactionId: tx.id,
        });
        setApproval(appr);
      } catch (err) {
        console.error(err);
        setError("Không thể tạo yêu cầu rút tiền.");
        setStatus("FAILED");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [amount, amountParam, user?.shopId]);

  // 2) Poll trạng thái giống deposit
  useEffect(() => {
    if (!approval || !user?.shopId) return;

    const createdAt = new Date(approval.createdAt);
    const fromTime = new Date(
      createdAt.getTime() - 60 * 60 * 1000
    ).toISOString();
    const toTime = new Date(createdAt.getTime() + 60 * 60 * 1000).toISOString();

    const poll = async () => {
      try {
        const list = await filterWalletTransactions({
          ShopId: user.shopId,
          Types: [WalletTransactionType.Withdraw],
          FromTime: fromTime,
          ToTime: toTime,
          PageIndex: 1,
          PageSize: 50,
        });

        const items: WalletTransactionDTO[] = Array.isArray(list?.items)
          ? (list.items as WalletTransactionDTO[])
          : [];

        const candidates = items.filter(
          (it) =>
            Number(it.amount) === Number(approval.amount) &&
            (!approval.description ||
              (it.description || "")
                .toLowerCase()
                .includes(approval.description.toLowerCase()))
        );

        const match = candidates
          .map((it) => ({
            it,
            d: Math.abs(new Date(it.createdAt).getTime() - createdAt.getTime()),
          }))
          .sort((a, b) => a.d - b.d)[0]?.it;

        if (match) {
          const raw = match.status;
          const done =
            raw === WalletTransactionStatus.Success ||
            String(raw).toLowerCase() === "success";
          const failed =
            raw === WalletTransactionStatus.Failed ||
            String(raw).toLowerCase() === "failed";
          const canceled =
            raw === WalletTransactionStatus.Canceled ||
            String(raw).toLowerCase() === "canceled" ||
            String(raw).toLowerCase() === "cancelled";

          if (done) {
            setStatus("SUCCESS");
            return;
          }
          if (failed || canceled) {
            setStatus("FAILED");
            return;
          }
        }
      } catch (e) {
        console.warn("Polling withdraw status failed", e);
      }
    };

    pollTimerRef.current = setInterval(poll, 6000);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [approval, user?.shopId]);

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Rút tiền</h1>

      {loading && (
        <div className="flex justify-center items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" /> Đang tạo mã QR...
        </div>
      )}

      {error && <p className="text-center text-red-500">{error}</p>}

      {approval && (
        <>
          {status === "PENDING" && (
            <Card className="p-6">
              <CardHeader className="text-center">
                <CardTitle className="text-blue-600">
                  Quét QR để xác nhận rút tiền
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Image
                  width={288}
                  height={288}
                  src={
                    approval.qrCode.includes("|")
                      ? approval.qrCode.split("|")[0]
                      : approval.qrCode
                  }
                  alt="QR Rút Tiền"
                  className="w-72 h-72 object-contain border p-2 rounded-lg"
                />
                <div className="text-center space-y-1">
                  <p>
                    <span className="font-medium">Mã thanh toán:</span>{" "}
                    {approval.paymentId}
                  </p>
                  {approval.description && (
                    <p>
                      <span className="font-medium">Nội dung:</span>{" "}
                      {approval.description}
                    </p>
                  )}
                  <p className="text-blue-700 font-semibold">
                    Số tiền: {approval.amount.toLocaleString("vi-VN")}đ
                  </p>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Sau khi quét và xác nhận, hệ thống sẽ tự động cập nhật trạng
                  thái trong ít phút.
                </p>
              </CardContent>
            </Card>
          )}

          {status === "SUCCESS" && (
            <Card className="p-6 border-green-400 bg-green-50">
              <CardContent className="flex flex-col items-center gap-3">
                <CheckCircle className="w-12 h-12 text-green-600" />
                <p className="text-green-700 font-bold text-lg">
                  Rút tiền thành công!
                </p>
                <Button
                  className="mt-2 bg-green-600 hover:bg-green-700"
                  onClick={() => router.push("/shop/manager-wallet")}
                >
                  Quay về ví
                </Button>
              </CardContent>
            </Card>
          )}

          {status === "FAILED" && (
            <Card className="p-6 border-red-400 bg-red-50">
              <CardContent className="flex flex-col items-center gap-3">
                <XCircle className="w-12 h-12 text-red-600" />
                <p className="text-red-700 font-bold text-lg">
                  Rút tiền thất bại hoặc đã hủy.
                </p>
                <Button
                  className="mt-2 bg-red-600 hover:bg-red-700"
                  onClick={() => router.push("/shop/manager-wallet")}
                >
                  Quay về ví
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
