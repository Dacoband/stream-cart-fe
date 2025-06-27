"use client";

import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

import { Card } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "T2", desktop: 186 },
  { month: "T3", desktop: 305 },
  { month: "T4", desktop: 237 },
  { month: "T5", desktop: 73 },
  { month: "T6", desktop: 209 },
  { month: "T7", desktop: 214 },
  { month: "CN", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#5EA500",
  },
} satisfies ChartConfig;

export function LineChartComponent() {
  return (
    <Card className="p-0">
      <div className="px-4 py-4 flex justify-between items-center border-b">
        <h3 className="font-bold text-xl">Quản lý doanh thu</h3>
        <div>
          <div className="text-sm font-semibold text-black/70">
            Doanh thu hôm nay
          </div>
          <div className="text-lg font-bold text-center text-lime-600">
            200.000 đ
          </div>
        </div>
      </div>
      <ChartContainer
        config={chartConfig}
        className="h-[350px] w-full px-10 py-4"
      >
        <LineChart
          data={chartData}
          margin={{
            top: 12,
            left: 10,
            right: 10,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={6}
            tickFormatter={(value) =>
              typeof value === "string"
                ? value.slice(0, 3)
                : String(value).slice(0, 3)
            }
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Line
            dataKey="desktop"
            type="natural"
            stroke="var(--color-desktop)"
            strokeWidth={3}
            dot={{
              fill: "var(--color-desktop)",
            }}
            activeDot={{
              r: 5,
            }}
          >
            <LabelList
              position="top"
              offset={8}
              className="fill-foreground"
              fontSize={12}
            />
          </Line>
        </LineChart>
      </ChartContainer>
    </Card>
  );
}
