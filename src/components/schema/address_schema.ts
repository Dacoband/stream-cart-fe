import { z } from 'zod';


export const registerAddress = z.object({
  
  street: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
  ward: z.string().min(1, 'Vui lòng chọn phường xã'),
  district: z.string().min(1, 'Vui lòng chọn quận huyện'),
  city: z.string().min(1, 'Vui lòng chọn tỉnh'),



});

export type AddressSchema = z.infer<typeof registerAddress>;