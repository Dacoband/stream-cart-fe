"use client";
import React, { useMemo, useState, useEffect } from "react";
import BreadcrumbNewFlashSale from "../components/BreadcrumbNewFlashSale";
import { Card, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  getSlotCreate,
  createFlashSale,
} from "@/services/api/product/flashSale";
import { SLOT_TIMES, CreateFlashSale } from "@/types/product/flashSale";
import ProductFlashSale from "../components/ProductFalshSale";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

function Newpage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [slot, setSlot] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingbt, setLoadingbt] = useState(false);
  const router = useRouter();

  const [rows, setRows] = useState<
    {
      productId: string;
      variantId: string | null;
      price: number;
      stock: number;
    }[]
  >([]);

  const dateLabel = useMemo(() => {
    if (!date) return "Chưa chọn";
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, [date]);
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("sv-SE");
  };
  const canCreate = useMemo(() => {
    if (!date || slot == null) return false;
    if (!rows.length) return false;
    return true;
  }, [date, slot, rows.length]);

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoadingbt(true);
    try {
      const byProduct = new Map<
        string,
        {
          variantIds: Set<string>;
          minPrice: number;
          totalQty: number;
          hasNullVariant: boolean;
        }
      >();
      for (const r of rows) {
        const g = byProduct.get(r.productId) ?? {
          variantIds: new Set<string>(),
          minPrice: Number.POSITIVE_INFINITY,
          totalQty: 0,
          hasNullVariant: false,
        };
        if (r.variantId) g.variantIds.add(r.variantId);
        else g.hasNullVariant = true;
        g.minPrice = Math.min(g.minPrice, r.price);
        g.totalQty += r.stock;
        byProduct.set(r.productId, g);
      }

      const products = Array.from(byProduct.entries()).map(([productId, g]) => {
        const ids = Array.from(g.variantIds);
        return {
          productId,
          variantIds: ids,
          flashSalePrice:
            g.minPrice === Number.POSITIVE_INFINITY ? 0 : g.minPrice,
          quantityAvailable: g.totalQty,
        };
      });

      const payload: CreateFlashSale = {
        products,
        slot: slot!,
        date: formatDate(date!),
      };

      await createFlashSale(payload);
      router.push("/shop/manager-flashSale");
      toast.success("Thêm Flash Sale thành công!");
    } catch (error: unknown) {
      console.error("Update user failed:", error);
      const err = error as AxiosError<{ message?: string }>;
      const messages =
        err?.response?.data?.message ?? "Thêm Flash Sale thất bại!";
      toast.error(messages);
    } finally {
      setLoadingbt(false);
    }
  };

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    getSlotCreate(date)
      .then((res) => {
        setAvailableSlots(res?.data || []);

        setSlot((prev) =>
          res?.data?.includes(prev) ? prev : res?.data?.[0] ?? null
        );
      })
      .finally(() => setLoadingSlots(false));
  }, [date]);

  return (
    <div className="flex flex-col gap-6  min-h-full">
      {/* Header cố định */}
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <BreadcrumbNewFlashSale />
      </div>

      <div className="w-[90%] mx-auto mb-10">
        {/* Card 1: Thời gian Flash Sale */}
        <Card className="bg-white p-8 rounded-xl shadow-sm">
          <CardTitle className="text-xl font-medium">
            <span className="text-red-500 text-lg">*</span> Thời gian Flash Sale
          </CardTitle>
          <div className="flex gap-10">
            {/* Calendar */}
            <div>
              <h2 className="font-semibold text-lg mb-4">Chọn ngày</h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-xl border shadow-sm p-4 cursor-pointer
                  min-w-[340px] min-h-[360px] 
                  [&_.rdp-table]:text-base 
                  [&_.rdp-day]:h-12 [&_.rdp-day]:w-12"
              />
              <div className="mt-4 text-sm h-8 text-center text-lime-600 ">
                <span className="text-muted-foreground">Đã chọn:</span>{" "}
                <span className="font-medium">{dateLabel}</span> •{"  "}
                <span className="font-medium">
                  {slot !== null && SLOT_TIMES[slot]
                    ? `Thời gian: ${SLOT_TIMES[slot].start} - ${SLOT_TIMES[slot].end}`
                    : "Chưa chọn khung giờ"}
                </span>
              </div>
            </div>

            {/* Slots */}
            <div className="w-1/2 h-full">
              <h2 className="font-semibold text-lg mb-4">Chọn khung giờ</h2>
              <div className="border rounded-none flex-1 h-full overflow-hidden shadow-sm w-full">
                <div className="h-full overflow-auto">
                  {loadingSlots ? (
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted text-left">
                          <th className="px-4 py-2 w-12"></th>
                          <th className="px-4 py-2">Bắt đầu</th>
                          <th className="px-4 py-2">Kết thúc</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td
                            colSpan={3}
                            className="p-4 text-center text-gray-500"
                          >
                            Đang tải khung giờ…
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#B0F847]/80 text-left text-black/80">
                          <th className="px-4 py-2 w-12"></th>
                          <th className="px-4 py-2  font-medium">
                            Thời gian bắt đầu
                          </th>
                          <th className="px-4 py-2  font-medium">
                            Thời gian kết thúc
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.keys(SLOT_TIMES).map((slotKey) => {
                          const slotNum = Number(slotKey);
                          const slotTime = SLOT_TIMES[slotNum];
                          const isAvailable = availableSlots.includes(slotNum);

                          return (
                            <tr
                              key={slotNum}
                              className={`
          cursor-pointer transition-colors
          ${
            slot === slotNum
              ? isAvailable
                ? "bg-primary/10 text-primary font-medium"
                : "bg-muted/40 text-gray-400"
              : isAvailable
              ? "hover:bg-muted/40"
              : "text-gray-400 bg-muted/40"
          }
        `}
                              onClick={() => isAvailable && setSlot(slotNum)}
                            >
                              <td className="px-4 py-2">
                                <input
                                  type="radio"
                                  name="flash-slot"
                                  className="size-4 accent-primary"
                                  checked={slot === slotNum}
                                  onChange={() =>
                                    isAvailable && setSlot(slotNum)
                                  }
                                  disabled={!isAvailable}
                                />
                              </td>
                              <td className="px-4 py-2">{slotTime?.start}</td>
                              <td className="px-4 py-2">{slotTime?.end}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
          <CardTitle className="text-xl font-medium">
            <span className="text-red-500 text-lg">*</span>
            Sản phẩm Flash Sale
          </CardTitle>
          <ProductFlashSale date={date} slot={slot} onChange={setRows} />{" "}
          <div className="flex justify-end gap-5">
            <Link href={"/shop/manager-flashSale"}>
              <Button
                type="submit"
                className="px-8 font-normal py-2 h-full bg-white hover:bg-white border-2 text-black hover:text-black/50 text-base cursor-pointer"
              >
                Thoát
              </Button>
            </Link>
            <Button
              type="submit"
              className="px-8 h-full py-2 font-normal bg-[#B0F847] hover:bg-[#B0F847]/80 text-black hover:text-black/50 text-base cursor-pointer"
              disabled={loadingbt || !canCreate}
              onClick={handleCreate}
            >
              {loadingbt ? (
                <>
                  <Loader2 className="animate-spin mr-1" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-1" />
                  Tạo FlashSale
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Newpage;
