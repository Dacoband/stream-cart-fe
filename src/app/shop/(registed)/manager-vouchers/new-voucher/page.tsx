"use client";

import React from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateVoucherSchema,
  createVoucherSchema,
} from "@/components/schema/voucher_schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createVoucher } from "@/services/api/voucher/voucher";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import BreadcrumNewVoucher from "../components/BreadcrumNewVoucher";

export default function VoucherPage() {
  const { user } = useAuth();
  const router = useRouter();
  const form = useForm<CreateVoucherSchema>({
    resolver: zodResolver(
      createVoucherSchema
    ) as unknown as Resolver<CreateVoucherSchema>,
    defaultValues: {
      code: "",
      description: "",
      type: 1,
      value: 0,
      maxValue: 0,
      minOrderAmount: 0,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
      availableQuantity: 1,
    },
  });
  const typeValue = form.watch("type");

  const onSubmit = async (data: CreateVoucherSchema) => {
    if (!user?.shopId) {
      toast.error("Bạn không có quyền thực hiện");
      return;
    }
    try {
      const payload = {
        ...data,
        maxValue: data.type === 1 ? data.maxValue : undefined,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      await createVoucher(payload);
      toast.success("Tạo voucher thành công");
      router.push("/shop/manager-vouchers");
    } catch (err) {
      console.error(err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      const message =
        axiosErr?.response?.data?.message ?? "Tạo voucher thất bại";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <BreadcrumNewVoucher />
      </div>

      <div className="w-[90%] mx-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5 mx-5 mb-10"
          >
            <Card className="bg-white py-5 px-8 rounded-sm">
              <CardTitle className="text-xl font-medium">
                Tạo Voucher mới
              </CardTitle>
              <CardContent className="p-0 space-y-6">
                <div className="grid grid-cols-2 justify-start gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã code voucher:</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên voucher</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              maxLength={50}
                              onChange={(e) => {
                                if (e.target.value.length <= 50) {
                                  field.onChange(e);
                                }
                              }}
                              className="pr-12"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                              {field.value?.length || 0}/50
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phương thức giảm giá</FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn phương thức" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">
                              Giảm theo phần trăm giá trị đơn hàng
                            </SelectItem>
                            <SelectItem value="2">
                              Giảm theo số tiền mặc định
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị giảm:</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              className="pr-16"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                              {typeValue === 1 ? "%" : "VND"}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minOrderAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị tối thiểu đơn hàng:</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              className="pr-16"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                              VND
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
                        <FormLabel>Giá trị tối đa (nếu có)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              disabled={typeValue !== 1}
                              className="pr-16"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                              VND
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => {
                      // Calculate min value for datetime-local (current time, rounded to minutes)
                      const now = new Date();
                      now.setSeconds(0, 0);
                      const min = now.toISOString().slice(0, 16);
                      return (
                        <FormItem>
                          <FormLabel>Ngày bắt đầu</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" min={min} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="availableQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          className="pr-16"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-[#B0F847] text-black hover:bg-[#B0F847]/80 cursor-pointer"
                  >
                    Tạo Voucher
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
