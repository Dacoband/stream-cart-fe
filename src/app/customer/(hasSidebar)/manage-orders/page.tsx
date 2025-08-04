"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { withRoleProtection } from "@/lib/requireRole";
import { useState } from "react";

// Có thể lấy count động từ API, ở đây demo cứng
const ORDER_TABS = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ thanh toán", value: "0", count: 2 },
  { label: "Vận chuyển", value: "1", count: 1 },
  { label: "Chờ giao hàng", value: "2", count: 1 },
  { label: "Hoàn thành", value: "3", count: 5 },
  { label: "Đã hủy", value: "4" },
  { label: "Trả hàng/Hoàn tiền", value: "5" },
];

function ManagerOrders() {
  const [tab, setTab] = useState("all");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full rounded-none ">
      <TabsList className="grid grid-cols-7 w-full rounded-none h-fit border-b bg-white p-0 overflow-hidden shadow-none ">
        {ORDER_TABS.map(({ label, value, count }) => (
          <TabsTrigger
            key={value}
            value={value}
            className={`
    relative text-base py-3 px-3 rounded-none  font-normal
    data-[state=active]:bg-[#B0F847]/40  data-[state=active]:text-[#65a406]  data-[state=active]:font-normal cursor-pointer hover:text-lime-600
  

    flex items-center justify-center gap-1
  `}
          >
            {label}
            {typeof count === "number" && count > 0 && <div>({count})</div>}
          </TabsTrigger>
        ))}
      </TabsList>

      {ORDER_TABS.map(({ value }) => (
        <TabsContent key={value} value={value}>
          <div className="py-4">Dữ liệu cho tab: {value}</div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default withRoleProtection(ManagerOrders, [1]);
