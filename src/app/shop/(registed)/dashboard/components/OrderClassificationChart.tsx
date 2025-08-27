"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getOrdersByShop } from '@/services/api/order/order';

interface OrderClassification {
  livestreamOrders: number;
  basicOrders: number;
  total: number;
}

function OrderClassificationChart() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderClassification>({
    livestreamOrders: 0,
    basicOrders: 0,
    total: 0
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.shopId) return;
      
      setLoading(true);
      try {
        const response = await getOrdersByShop(user.shopId, { 
          PageIndex: 1, 
          PageSize: 1000
        });
        
        console.log('Full response:', response);
        
        let orders = null;
        if (response?.data?.items) {
          orders = response.data.items;
        } else if (response?.items) {
          orders = response.items;
        } else if (Array.isArray(response?.data)) {
          orders = response.data;
        } else if (Array.isArray(response)) {
          orders = response;
        }

        console.log('Orders array:', orders);
        
        if (orders && Array.isArray(orders)) {
          let livestreamCount = 0;
          let basicCount = 0;

          orders.forEach((order: { livestreamId?: string | null }) => {
            if (order.livestreamId && order.livestreamId !== null) {
              livestreamCount++;
            } else {
              basicCount++;
            }
          });

          console.log('Counts:', { livestreamCount, basicCount });

          setOrderData({
            livestreamOrders: livestreamCount,
            basicOrders: basicCount,
            total: livestreamCount + basicCount
          });
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.shopId]);

  const livestreamPercentage = orderData.total > 0 
    ? (orderData.livestreamOrders / orderData.total) * 100 
    : 0;
  
  const basicPercentage = orderData.total > 0 
    ? (orderData.basicOrders / orderData.total) * 100 
    : 0;

  // Prepare chart data - Sử dụng màu của logo project
  const chartData = useMemo(() => [
    { 
      type: "livestream", 
      orders: orderData.livestreamOrders, 
      fill: "#6366f1" // Tím đậm cho livestream (màu chính của logo)
    },
    { 
      type: "basic", 
      orders: orderData.basicOrders, 
      fill: "#a5b4fc" // Tím nhạt cho basic
    },
  ], [orderData]);

  const chartConfig = {
    orders: {
      label: "Đơn hàng",
    },
    livestream: {
      label: "Đơn Livestream",
      color: "#6366f1",
    },
    basic: {
      label: "Đơn Basic", 
      color: "#a5b4fc",
    },
  } satisfies ChartConfig;

  return (
    <Card className="shadow-sm h-full w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="text-blue-500" size={24} />
          Phân loại đơn hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="flex flex-col items-center gap-6">
          {/* Chart centered on top */}
          <div className="w-full flex justify-center">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-w-[360px] max-h-[360px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="orders"
                  nameKey="type"
                  innerRadius={90}
                  outerRadius={130}
                  strokeWidth={6}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {loading ? '...' : orderData.total}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 26}
                              className="fill-muted-foreground text-sm"
                            >
                              Tổng đơn
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* Legends / notes below chart - compact and centered */}
          <div className="w-full flex flex-wrap justify-center gap-4 max-w-[760px]">
            <div className="flex items-center gap-3 p-2 rounded-md bg-indigo-50 border border-indigo-100">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <div className="text-sm">
                <div className="font-medium text-indigo-800">Đơn Livestream</div>
                <div className="text-xs text-indigo-600">{loading ? '...' : orderData.livestreamOrders} · {loading ? '...' : `${livestreamPercentage.toFixed(1)}%`}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-md bg-indigo-25 border border-indigo-50">
              <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
              <div className="text-sm">
                <div className="font-medium text-indigo-700">Đơn Basic</div>
                <div className="text-xs text-indigo-500">{loading ? '...' : orderData.basicOrders} · {loading ? '...' : `${basicPercentage.toFixed(1)}%`}</div>
              </div>
            </div>
          </div>

          {/* summary removed - total displayed in the donut center */}
         </div>
       </CardContent>
     </Card>
   );
 }
 
 export default OrderClassificationChart;
