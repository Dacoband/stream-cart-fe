
import { z } from 'zod';
export const userUpdateSchema = z.object({
  
  fullname: z.string().min(1, "Tên đăng nhập là bắt buộc"),


 

 phoneNumber: z
  .string()
  .regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),


});
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
