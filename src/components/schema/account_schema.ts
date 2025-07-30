import { z } from 'zod';

export const userUpdateSchema = z.object({
  fullname: z.string({
    required_error: "Họ và tên là bắt buộc"
  }).nonempty("Họ và tên là bắt buộc"),

  phoneNumber: z.string({
    required_error: "Số điện thoại là bắt buộc"
  })
    .nonempty("Số điện thoại là bắt buộc")
    .regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),
});

export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
