"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
// import { toast } from 'sonner'

import { getRefundById } from "@/services/api/refund/refund";
import { RefundStatus } from "@/types/refund/refund";
import { generateRefundQrCode } from "@/services/api/payment/payment";

type TxStatus = "PENDING" | "SUCCESS" | "FAILED";

export default function RefundPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refundId = searchParams.get("id");

  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<TxStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1) Gọi generateRefundQr
  useEffect(() => {
    if (!refundId) {
      setError("Thiếu refundId.");
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        const qrCode = await generateRefundQrCode(refundId);
        setQr(qrCode.includes("|") ? qrCode.split("|")[0] : qrCode);
      } catch (e) {
        console.error(e);
        setError("Không thể tạo mã QR hoàn tiền.");
        setStatus("FAILED");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [refundId]);

  // 2) Poll trạng thái refund
  useEffect(() => {
    if (!refundId || !qr) return;

    const poll = async () => {
      try {
        const refund = await getRefundById(refundId);
        if (refund?.status === RefundStatus.Refunded) {
          setStatus("SUCCESS");
          // Sau 1s chuyển về detail
          setTimeout(() => {
            router.push(`/manager/refund/${refundId}`);
          }, 1000);
        }
      } catch (e) {
        console.warn("Polling refund status failed", e);
      }
    };

    pollTimerRef.current = setInterval(poll, 6000);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [refundId, qr, router]);

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Hoàn tiền Refund</h1>

      {loading && (
        <div className="flex justify-center items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" /> Đang tạo mã QR...
        </div>
      )}

      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && qr && status === "PENDING" && (
        <Card className="p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-600">
              Quét QR để hoàn tiền cho khách
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Image
              width={288}
              height={288}
              src={qr}
              alt="Refund QR"
              className="w-72 h-72 object-contain border p-2 rounded-lg"
            />
            <p className="text-sm text-gray-500 text-center">
              Sau khi quét, hệ thống sẽ tự động cập nhật trạng thái.
            </p>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/manager/refund/${refundId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại yêu cầu
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "SUCCESS" && (
        <Card className="p-6 border-green-400 bg-green-50">
          <CardContent className="flex flex-col items-center gap-3">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <p className="text-green-700 font-bold text-lg">
              Hoàn tiền thành công!
            </p>
            <Button
              className="mt-2 bg-green-600 hover:bg-green-700"
              onClick={() => router.push(`/manager/refund/${refundId}`)}
            >
              Quay lại yêu cầu
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "FAILED" && (
        <Card className="p-6 border-red-400 bg-red-50">
          <CardContent className="flex flex-col items-center gap-3">
            <XCircle className="w-12 h-12 text-red-600" />
            <p className="text-red-700 font-bold text-lg">
              Tạo QR thất bại hoặc đã hủy.
            </p>
            <Button
              className="mt-2 bg-red-600 hover:bg-red-700"
              onClick={() => router.push(`/manager/refund/${refundId}`)}
            >
              Quay lại yêu cầu
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
