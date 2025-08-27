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

interface RevenueDataItem {
  day: string;
  revenue: number;
  date: string;
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
  const [revenueData, setRevenueData] = React.useState<RevenueDataItem[]>([]);

  React.useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        // TODO: Gọi API thực tế
        // Hiện tại sử dụng dữ liệu demo cho 7 ngày gần nhất
        const demoData = [
          { day: "T2", revenue: 12500000, date: "20/08" },
          { day: "T3", revenue: 15800000, date: "21/08" },
          { day: "T4", revenue: 11200000, date: "22/08" },
          { day: "T5", revenue: 18900000, date: "23/08" },
          { day: "T6", revenue: 22300000, date: "24/08" },
          { day: "T7", revenue: 19700000, date: "25/08" },
          { day: "CN", revenue: 16500000, date: "26/08" },
        ];
        
        setTimeout(() => {
          setRevenueData(demoData);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
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
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
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
            {loading ? "..." : `${(revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length).toLocaleString()}đ`}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Cao nhất</div>
          <div className="font-semibold text-green-600">
            {loading ? "..." : `${Math.max(...revenueData.map(item => item.revenue)).toLocaleString()}đ`}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Thấp nhất</div>
          <div className="font-semibold text-red-600">
            {loading ? "..." : `${Math.min(...revenueData.map(item => item.revenue)).toLocaleString()}đ`}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default RevenueChart;
