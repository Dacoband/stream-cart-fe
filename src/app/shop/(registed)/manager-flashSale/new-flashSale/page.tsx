"use client";
import React, { useMemo, useState } from "react";
import BreadcrumbNewFlashSale from "../components/BreadcrumbNewFlashSale";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import ProductsLivestream from "../components/ProductFalshSale";

type Slot = { id: string; label: string; note?: string };
const SLOTS: Slot[] = [
  { id: "00-02", label: "00:00:00 - 02:00:00" },
  { id: "02-09", label: "02:00:00 - 09:00:00" },
  { id: "09-12", label: "09:00:00 - 12:00:00" },
  { id: "12-15", label: "12:00:00 - 15:00:00" },
  { id: "15-17", label: "15:00:00 - 17:00:00" },
  { id: "17-19", label: "17:00:00 - 19:00:00" },
  { id: "19-21", label: "19:00:00 - 21:00:00" },
  { id: "21-00", label: "21:00:00 - 00:00:00", note: "+1" },
];

function Newpage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slot, setSlot] = useState<string>("21-00");

  const dateLabel = useMemo(() => {
    if (!date) return "Chưa chọn";
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, [date]);

  return (
    <div className="flex flex-col gap-6 min-h-full">
      {/* Header cố định */}
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <BreadcrumbNewFlashSale />
      </div>

      <div className="w-[90%] mx-auto">
        {/* Card 1: Thời gian Flash Sale */}
        <Card className="bg-white p-8 rounded-xl shadow-sm">
          <div className="flex gap-10">
            {/* Calendar bên trái */}
            <div>
              <h2 className="font-semibold text-lg mb-4">Chọn ngày</h2>
              <Calendar
                mode="single"
                selected={date}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                onSelect={setDate}
                className="rounded-xl border shadow-sm p-4
                
             min-w-[340px] min-h-[360px] 
             [&_.rdp-table]:text-base 
             [&_.rdp-day]:h-10 [&_.rdp-day]:w-10"
              />
            </div>

            {/* Khung giờ bên phải */}
            <div className="w-1/2">
              <h2 className="font-semibold text-lg mb-4">Chọn khung giờ</h2>
              <div className="border rounded-xl overflow-hidden shadow-sm w-full">
                <div className="px-4 py-2 text-sm font-medium bg-muted/40">
                  Danh sách khung giờ
                </div>
                <div className="max-h-80 overflow-auto divide-y">
                  {SLOTS.map((s) => {
                    const isActive = slot === s.id;
                    return (
                      <label
                        key={s.id}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/40"
                        )}
                      >
                        <input
                          type="radio"
                          name="flash-slot"
                          className="size-4 accent-primary"
                          checked={isActive}
                          onChange={() => setSlot(s.id)}
                        />
                        <span className="flex items-center gap-1">
                          {s.label}
                          {s.note && (
                            <span className="text-xs text-muted-foreground">
                              {s.note}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Kết quả đã chọn */}
              <div className="mt-4 text-sm">
                <span className="text-muted-foreground">Đã chọn:</span>{" "}
                <span className="font-medium">{dateLabel}</span> •{" "}
                <span className="font-medium">
                  {SLOTS.find((s) => s.id === slot)?.label}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Sản phẩm Flash Sale (tái sử dụng UI ProductLive) */}
        <Card className="bg-white p-8 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Sản phẩm Flash Sale</h2>
          <ProductsLivestream />
        </Card>
      </div>
    </div>
  );
}

export default Newpage;
