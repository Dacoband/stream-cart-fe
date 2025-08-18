"use client";
import React from "react";
import { useAuth } from '@/lib/AuthContext';
import { getVouchersByShop } from '@/services/api/voucher/voucher';
import { Voucher } from '@/types/voucher/voucher';
import { Card } from '@/components/ui/card';

function VouchersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [vouchers, setVouchers] = React.useState<Voucher[]>([]);

  React.useEffect(() => {
    if (!user?.shopId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getVouchersByShop(user.shopId, { isActive: true, type: 1, isExpired: false, pageNumber: 1, pageSize: 10 });
        setVouchers(res.items || []);
      } catch (err) {
        console.error('Fetch vouchers error', err);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [user?.shopId]);

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div className="">
          <h2 className="text-xl font-bold">Voucher</h2>
        </div>
      </div>
      <div className="mx-5 mb-10">
        <Card className="p-4">
          {loading ? (
            <div>Đang tải...</div>
          ) : vouchers.length === 0 ? (
            <div>Chưa có voucher</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left">
                    <th className="py-2">Mã</th>
                    <th className="py-2">Loại</th>
                    <th className="py-2">Giá trị</th>
                    <th className="py-2">Giá tối đa</th>
                    <th className="py-2">Giá tối thiểu đơn hàng</th>
                    <th className="py-2">Số lượng</th>
                    <th className="py-2">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="py-2">{v.code}</td>
                      <td className="py-2">{v.type === 1 ? '% (Giảm phần trăm)' : 'Tiền (VNĐ)'}</td>
                      <td className="py-2">{v.type === 1 ? `${v.value}%` : `${v.value}K`}</td>
                      <td className="py-2">{v.maxValue != null ? v.maxValue.toLocaleString('vi-VN') : '-'}</td>
                      <td className="py-2">{v.minOrderAmount != null ? v.minOrderAmount.toLocaleString('vi-VN') + '₫' : '-'}</td>
                      <td className="py-2">{v.availableQuantity}</td>
                      <td className="py-2">{new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default VouchersPage;
