"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, Loader2, TicketPercent } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Voucher, UpdateVoucher } from "@/types/voucher/voucher";
import { updateVoucher } from "@/services/api/voucher/voucher";

interface DialogUpdate {
  onSuccess?: () => void;
  voucher: Voucher | null;
  open?: boolean;
  onClose?: () => void;
}

function toInputDate(v: Date | string | undefined) {
  if (!v) return "";
  const d = new Date(v);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const DialogUpdateVoucher: React.FC<DialogUpdate> = ({
  onSuccess,
  voucher,
  open,
  onClose,
}) => {
  const [loadingbt, setLoadingbt] = useState(false);
  const usedQty = voucher?.usedQuantity ?? 0;
  const startDateIsPast = voucher
    ? new Date(voucher.startDate) < new Date()
    : false;

  const schema = useMemo(
    () =>
      z
        .object({
          code: z.string().optional(),
          description: z.string().min(1, "Mô tả không được để trống"),
          value: z.coerce.number().min(0, "Giá trị không hợp lệ"),
          maxValue: z.coerce.number().min(0).optional(),
          minOrderAmount: z.coerce.number().min(0).optional(),
          startDate: z.string(),
          endDate: z.string(),
          availableQuantity: z.coerce
            .number()
            .int()
            .min(1, "Số lượng khả dụng phải lớn hơn 0"),
        })
        .superRefine((data, ctx) => {
          const now = new Date();
          const sd = new Date(data.startDate);
          const ed = new Date(data.endDate);
          if (ed < now) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["endDate"],
              message: "Thời gian kết thúc không được nhỏ hơn hiện tại",
            });
          }
          if (ed <= sd) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["endDate"],
              message: "Ngày kết thúc phải sau ngày bắt đầu",
            });
          }
          if (data.availableQuantity <= usedQty) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["availableQuantity"],
              message: `Số lượng khả dụng phải > đã dùng (${usedQty})`,
            });
          }
        }),
    [usedQty]
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: voucher?.code ?? "",
      description: voucher?.description ?? "",
      value: voucher?.value ?? 0,
      maxValue: voucher?.maxValue ?? 0,
      minOrderAmount: voucher?.minOrderAmount ?? 0,
      startDate: toInputDate(voucher?.startDate),
      endDate: toInputDate(voucher?.endDate),
      availableQuantity: voucher?.availableQuantity ?? 0,
    },
  });

  useEffect(() => {
    if (voucher && open) {
      form.reset({
        code: voucher.code || "",
        description: voucher.description || "",
        value: voucher.value || 0,
        maxValue: voucher.maxValue || 0,
        minOrderAmount: voucher.minOrderAmount || 0,
        startDate: toInputDate(voucher.startDate),
        endDate: toInputDate(voucher.endDate),
        availableQuantity: voucher.availableQuantity || 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voucher, open]);

  if (!voucher) return null;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoadingbt(true);
    try {
      const payload: UpdateVoucher = {
        description: data.description,
        value: Number(data.value),
        maxValue: Number(data.maxValue ?? 0),
        minOrderAmount: Number(data.minOrderAmount ?? 0),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        availableQuantity: Number(data.availableQuantity),
      };
      await updateVoucher(String(voucher.id), payload);
      toast.success("Cập nhật thành công!");
      onSuccess?.();
      onClose?.();
    } catch (error: unknown) {
      console.error("Update voucher failed:", error);
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Cập nhật thất bại!";
      toast.error(message);
    } finally {
      setLoadingbt(false);
    }
  };

  return (
    <div className="w-full">
      <Dialog open={Boolean(open)} onOpenChange={onClose}>
        <DialogContent className="m-0 py-5 max-h-[78vh] overflow-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#B0F847] rounded-lg flex items-center justify-center">
                <TicketPercent className="w-5 h-5 text-black" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Cập nhật thông tin voucher
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Chỉnh sửa thông tin voucher trong hệ thống
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full mx-auto space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã (không thể sửa)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá trị giảm</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            className="pr-16"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                            {voucher.type === 1 ? "%" : "VND"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giảm tối đa</FormLabel>
                      <FormControl>
                        <div className="relative">
                          {voucher.type === 1 ? (
                            <Input type="number" {...field} />
                          ) : (
                            <Input type="number" {...field} disabled />
                          )}
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                            VND
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minOrderAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn tối thiểu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" {...field} />{" "}
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                            VND
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="availableQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Số lượng khả dụng (đã dùng: {usedQty})
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian bắt đầu</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          disabled={startDateIsPast}
                        />
                      </FormControl>
                      {startDateIsPast && (
                        <p className="text-xs text-gray-500">
                          Thời gian bắt đầu đã qua, không thể thay đổi
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian kết thúc</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <div className="flex w-full justify-end gap-5 border-t pt-5 mt-4">
                  <DialogClose className="px-5 border text-black hover:text-black/80 cursor-pointer rounded-md">
                    Thoát
                  </DialogClose>
                  <Button
                    type="submit"
                    className="px-8 bg-[#B0F847] hover:bg-[#B0F847]/80 text-black"
                    disabled={loadingbt}
                  >
                    {loadingbt ? (
                      <>
                        <Loader2 className="animate-spin mr-1" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogUpdateVoucher;
