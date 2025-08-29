'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { createDeposit } from '@/services/api/payment/payment'
import { DepositResponse } from '@/types/payment/payment'
import { filterWalletTransactions } from '@/services/api/wallet/walletTransaction'
import { useAuth } from '@/lib/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

type TxStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export default function DepositPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [qrData, setQrData] = useState<DepositResponse | null>(null)
  const [status, setStatus] = useState<TxStatus>('PENDING')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  const amountParam = searchParams.get('amount')
  const amount = useMemo(() => {
    const v = Number(amountParam)
    return Number.isFinite(v) ? v : NaN
  }, [amountParam])

  // 1. Gọi API tạo QR
  useEffect(() => {
    if (!amountParam) {
      setError('Thiếu số tiền nạp.')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Số tiền nạp không hợp lệ.')
      return
    }

    setLoading(true)
    createDeposit({
      amount,
      shopId: user?.shopId ?? null,
    })
      .then((res) => {
        setQrData(res)
        setError(null)
        setStatus('PENDING')
      })
      .catch((e) => {
        setError(
          (e as Error).message || 'Không thể tạo mã nạp tiền. Vui lòng thử lại.'
        )
      })
      .finally(() => setLoading(false))
  }, [amount, amountParam, user?.shopId])

  // 2. Poll trạng thái
  useEffect(() => {
    if (!qrData || !user?.shopId) return

    const paymentId = qrData.paymentId
    const createdAt = new Date(qrData.createdAt)
    const fromTime = new Date(createdAt.getTime() - 60 * 1000).toISOString()

    const poll = async () => {
      try {
        const list = await filterWalletTransactions({
          ShopId: user.shopId,
          Types: [1], // Deposit
          FromTime: fromTime,
          ToTime: new Date().toISOString(),
          PageIndex: 1,
          PageSize: 50,
        })

        const match = (list.items ?? []).find(
          (it: any) => it.transactionId === paymentId
        )

        if (match) {
          if (match.status === 'Success') {
            setStatus('SUCCESS')
            return
          }
          if (match.status === 'Failed' || match.status === 'Canceled') {
            setStatus('FAILED')
            return
          }
        }
      } catch (e) {
        console.warn('Polling deposit status failed', e)
      }
    }

    pollTimerRef.current = setInterval(poll, 6000)
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [qrData, user?.shopId])

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Nạp tiền vào ví</h1>

      {loading && (
        <div className="flex justify-center items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" /> Đang tạo mã QR...
        </div>
      )}

      {error && <p className="text-center text-red-500">{error}</p>}

      {qrData && (
        <>
          {status === 'PENDING' && (
            <Card className="p-6">
              <CardHeader className="text-center">
                <CardTitle className="text-blue-600">
                  Quét QR để nạp tiền
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Image
                  width={288}
                  height={288}
                  src={qrData.qrCode.split('|')[0]}
                  alt="QR Nạp Tiền"
                  className="w-72 h-72 object-contain border p-2 rounded-lg"
                />
                <div className="text-center space-y-1">
                  <p>
                    <span className="font-medium">Mã thanh toán:</span>{' '}
                    {qrData.paymentId}
                  </p>
                  {qrData.description && (
                    <p>
                      <span className="font-medium">Nội dung:</span>{' '}
                      {qrData.description}
                    </p>
                  )}
                  <p className="text-green-600 font-semibold">
                    Số tiền: {qrData.amount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Sau khi chuyển khoản thành công, hệ thống sẽ tự động xác nhận
                  trong vài chục giây.
                </p>
              </CardContent>
            </Card>
          )}

          {status === 'SUCCESS' && (
            <Card className="p-6 border-green-400 bg-green-50">
              <CardContent className="flex flex-col items-center gap-3">
                <CheckCircle className="w-12 h-12 text-green-600" />
                <p className="text-green-700 font-bold text-lg">
                  Nạp tiền thành công!
                </p>
                <Button
                  className="mt-2 bg-green-600 hover:bg-green-700"
                  onClick={() => router.push('/shop/manager-wallet')}
                >
                  Quay về ví
                </Button>
              </CardContent>
            </Card>
          )}

          {status === 'FAILED' && (
            <Card className="p-6 border-red-400 bg-red-50">
              <CardContent className="flex flex-col items-center gap-3">
                <XCircle className="w-12 h-12 text-red-600" />
                <p className="text-red-700 font-bold text-lg">
                  Nạp tiền thất bại hoặc đã hủy.
                </p>
                <Button
                  className="mt-2 bg-red-600 hover:bg-red-700"
                  onClick={() => router.push('/shop/manager-wallet')}
                >
                  Quay về ví
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
