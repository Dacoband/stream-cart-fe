"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

import { getWalletTransactionById } from "@/services/api/wallet/walletTransaction";
import { WalletTransactionStatus } from "@/types/wallet/walletTransactionDTO";
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
  // const [walletTxId, setWalletTxId] = useState<string | null>(null);

  const txId = searchParams.get("id");

  // 1) Dùng id giao dịch ví từ param để tạo approval (lấy QR)
  useEffect(() => {
    if (!txId) {
      setError("Thiếu id giao dịch.");
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        setStatus("PENDING");

        // Gọi approve để lấy QR/paymentId bằng id giao dịch đã có
        const appr = await createWithdrawalApproval({
          walletTransactionId: txId,
        });
        setApproval(appr);
      } catch (error) {
        console.error(error);
        setError("Không thể tạo yêu cầu rút tiền.");
        setStatus("FAILED");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [txId, user?.shopId]);

  // 2) Poll trạng thái theo paymentId bằng cách truy vấn 1 giao dịch theo id
  useEffect(() => {
    if (!approval || !txId) return;

    const paymentId = approval.paymentId;

    const poll = async () => {
      try {
        const resp = await getWalletTransactionById(txId);
        const tx = (
          typeof (resp as { data?: unknown })?.data !== "undefined"
            ? (resp as { data?: unknown }).data
            : resp
        ) as {
          status?: number | string;
          transactionId?: string | null;
        } | null;
        if (!tx) return;

        // Nếu backend có trả transactionId, đảm bảo khớp với approval
        if (
          typeof tx.transactionId === "string" &&
          typeof paymentId === "string" &&
          tx.transactionId !== paymentId
        ) {
          return;
        }

        const raw = tx.status;
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
      } catch (e) {
        console.warn("Polling withdraw status failed", e);
      }
    };

    pollTimerRef.current = setInterval(poll, 6000);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [approval, txId]);

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
                  // BE trả base64 hoặc URL; nếu là base64 thì giữ nguyên, nếu là "xxx|meta" như deposit thì tách:
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
                  onClick={() => router.push("/manager/transaction")}
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
                  onClick={() => router.push("/manager/transaction")}
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
