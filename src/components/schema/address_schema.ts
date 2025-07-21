import { z } from 'zod';


export const registerAddress = z.object({
  
  street: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
  // ward: z.string().min(1, 'Vui lòng chọn phường xã'),
  // district: z.string().min(1, 'Vui lòng chọn quận huyện'),
  // city: z.string().min(1, 'Vui lòng chọn tỉnh'),
  ward: z.string().nonempty("Vui lòng chọn phường xã"),
district: z.string().nonempty("Vui lòng chọn quận huyện"),
city: z.string().nonempty("Vui lòng chọn tỉnh / thành phố"),




});

export type AddressSchema = z.infer<typeof registerAddress>;
// Create For Customer
export const registerAddressCustomer = z.object({
  phonenumber: z
  .string()
  .regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),

  street: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
 recipientName: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
  ward: z.string().nonempty("Vui lòng chọn phường xã"),
district: z.string().nonempty("Vui lòng chọn quận huyện"),
city: z.string().nonempty("Vui lòng chọn tỉnh / thành phố"),




});
export type AddressSchemaCustomer = z.infer<typeof registerAddressCustomer>;