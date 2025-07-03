import { z } from 'zod';


export const registerSellSchema = z.object({
  shopName: z.string().min(1, 'Tên cửa hàng không được để trống'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự').max(250, 'Mô tả tối đa 300 ký tự'),


});

export type RegisterSellerSchema = z.infer<typeof registerSellSchema>;