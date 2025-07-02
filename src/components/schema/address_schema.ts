import { z } from 'zod';


export const registerAddress = z.object({
  recipientName: z.string().min(1, 'Tên người nhận không được để trống'),
  phonenumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  street: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
  ward: z.string().min(1, 'Vui lòng chọn phường xã'),
  district: z.string().min(1, 'Vui lòng chọn quận huyện'),
  city: z.string().min(1, 'Vui lòng chọn tỉnh'),



});

export type AddressSchema = z.infer<typeof registerAddress>;