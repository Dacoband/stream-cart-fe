"use client";

import { Card } from "@/components/ui/card";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getSystemOrderTimeSeries } from "@/services/api/statistics/statistics";

interface RevenueDataItem {
  day: string; // Nhãn thứ trong tuần (T2..CN)
  revenue: number;
  date: string; // dd/MM
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

function RevenueChart() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [revenueData, setRevenueData] = React.useState<RevenueDataItem[]>([]);

  React.useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Lấy 7 ngày gần nhất (bao gồm hôm nay)
        const to = new Date();
        const from = new Date(to.getTime() - 6 * 24 * 60 * 60 * 1000);

        // Gọi API hệ thống (period=daily)
        const res = await getSystemOrderTimeSeries({
          fromDate: from,
          toDate: to,
          period: "daily",
        });

        // Service đang trả: response.data?.data ?? response.data
        // nên ở đây res đã là DTO hoặc ApiResponse<DTO>. Xử lý an toàn:
        const dto = res.data ?? res;

        const points = dto?.dataPoints ?? [];

        // Map về dữ liệu chart
        const viDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        const fmtDDMM = (d: Date) =>
          `${String(d.getUTCDate()).padStart(2, "0")}/${String(
            d.getUTCMonth() + 1
          ).padStart(2, "0")}`;

        const data: RevenueDataItem[] = points.map((p: RevenueDataItem) => {
          const d = new Date(p.date);
          const day = viDays[d.getUTCDay()];
          return {
            day,
            revenue: Number(p.revenue ?? 0),
            date: fmtDDMM(d),
          };
        });

        // Đảm bảo đúng 7 điểm, sort theo ngày tăng dần
        data.sort((a, b) => {
          const [da, ma] = a.date.split("/").map(Number);
          const [db, mb] = b.date.split("/").map(Number);
          if (ma !== mb) return ma - mb;
          return da - db;
        });

        setRevenueData(data);
      } catch (err) {
        console.error("Error fetching revenue data:", err);
        setError("Không thể tải dữ liệu doanh thu");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  const formatCurrencyAxis = (value: number) => {
    // Hiển thị theo triệu: 12.3M
    return `${(value / 1_000_000).toFixed(1)}M`;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          <p className="text-blue-600">
            {`Doanh thu: ${payload[0].value.toLocaleString()}đ`}
          </p>
        </div>
      );
    }
    return null;
  };

  const avg =
    revenueData.length > 0
      ? revenueData.reduce((s, i) => s + i.revenue, 0) / revenueData.length
      : 0;

  const maxVal =
    revenueData.length > 0 ? Math.max(...revenueData.map((i) => i.revenue)) : 0;

  const minVal =
    revenueData.length > 0 ? Math.min(...revenueData.map((i) => i.revenue)) : 0;

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-xl">Tổng doanh thu 7 ngày gần nhất</h3>
          <p className="text-gray-500 text-sm">Biểu đồ doanh thu theo ngày</p>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Đang tải dữ liệu...</div>
        </div>
      ) : error ? (
        <div className="h-80 flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} />
              <YAxis
                tickFormatter={formatCurrencyAxis}
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date}
                content={<CustomTooltip />}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500">Trung bình/ngày</div>
          <div className="font-semibold text-blue-600">
            {loading ? "..." : `${Math.round(avg).toLocaleString()}đ`}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Cao nhất</div>
          <div className="font-semibold text-green-600">
            {loading ? "..." : `${maxVal.toLocaleString()}đ`}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Thấp nhất</div>
          <div className="font-semibold text-red-600">
            {loading ? "..." : `${minVal.toLocaleString()}đ`}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default RevenueChart;
