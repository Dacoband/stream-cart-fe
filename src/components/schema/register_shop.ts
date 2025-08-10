import { z } from 'zod';


export const registerSellSchema = z.object({
  shopName: z.string().min(1, 'Tên cửa hàng không được để trống'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự').max(250, 'Mô tả tối đa 300 ký tự'),

  street: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
    ward: z.string().nonempty("Vui lòng chọn phường xã"),
district: z.string().nonempty("Vui lòng chọn quận huyện"),
city: z.string().nonempty("Vui lòng chọn tỉnh / thành phố"),
bankName: z.string().nonempty("Vui lòng chọn ngân hàng"),
bankNumber: z.string().nonempty("Vui lòng nhập số tài khoản ngân hàng"),
tax: z.string().nonempty("Vui lòng nhập mã số thuế"),
});

export type RegisterSellerSchema = z.infer<typeof registerSellSchema>;