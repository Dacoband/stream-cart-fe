import { z } from 'zod';


export const registerSellSchema = z.object({
  shopName: z.string().min(1, 'Tên cửa hàng không được để trống'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự').max(250, 'Mô tả tối đa 200 ký tự'),
  logoURL: z.string().url("Avatar không hợp lệ").optional(),
  coverImage:z.string().url("Avatar không hợp lệ").optional(),

});

export type RegisterSellerSchema = z.infer<typeof registerSellSchema>;