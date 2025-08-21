"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateVoucherSchema, createVoucherSchema } from '@/components/schema/voucher_schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { createVoucher } from '@/services/api/voucher/voucher';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

export default function VoucherPage(){
  const { user } = useAuth();
  const router = useRouter();
  const form = useForm<CreateVoucherSchema>({
    // zodResolver's inferred types can sometimes be incompatible with the explicit generic
    // cast it to the expected Resolver type for CreateVoucherSchema
    resolver: zodResolver(createVoucherSchema) as unknown as Resolver<CreateVoucherSchema>,
    defaultValues: {
      code: '',
      description: '',
      type: 1,
      value: 0,
      maxValue: 0,
      minOrderAmount: 0,
      startDate: new Date().toISOString().slice(0,16),
      endDate: new Date(Date.now()+24*60*60*1000).toISOString().slice(0,16),
      availableQuantity: 1,
    }
  });

  const onSubmit = async (data: CreateVoucherSchema) => {
    if (!user?.shopId) { toast.error('Bạn không có quyền thực hiện'); return; }
    try{
      await createVoucher({
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });
      toast.success('Tạo voucher thành công');
      router.push('/shop/vouchers');
    }catch(err){
      console.error(err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      const message = axiosErr?.response?.data?.message ?? 'Tạo voucher thất bại';
      toast.error(message);
    }
  }

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <h2 className="text-xl font-bold">Quản lý Voucher</h2>
      </div>

      <div className="w-[90%] mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 mx-5 mb-10">
            <Card className="bg-white py-5 px-8 rounded-sm">
              <CardTitle className="text-xl font-medium">Tạo Voucher mới</CardTitle>
              <CardContent className="p-0 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã voucher</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại (1 = % , 2 = tiền)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="value" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá trị</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="maxValue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá trị tối đa (nếu có)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="minOrderAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá trị tối thiểu đơn hàng</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="availableQuantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="endDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-end">
                  <Button type="submit" className="bg-[#B0F847] text-black">Tạo Voucher</Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  )
}
