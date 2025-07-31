import { z } from 'zod';

export const createModeratorSchema = z.object({
  username: z.string({
    required_error: "Tên đăng nhập là bắt buộc",
  }).nonempty("Tên đăng nhập là bắt buộc"),

  fullname: z.string({
    required_error: "Họ và tên là bắt buộc",
  }).nonempty("Họ và tên là bắt buộc"),

  password: z.string({
    required_error: "Mật khẩu là bắt buộc",
  }).min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

  confirmPassword: z.string({
    required_error: "Xác nhận mật khẩu là bắt buộc",
  }).min(6, "Xác nhận mật khẩu là bắt buộc"),

  email: z.string({
    required_error: "Email là bắt buộc",
  })
    .nonempty("Email là bắt buộc")
    .email("Email không hợp lệ"),

  avatarUrl: z.string()
    .url("Avatar không hợp lệ")
    .optional(),

  phoneNumber: z.string({
    required_error: "Số điện thoại là bắt buộc",
  })
    .nonempty("Số điện thoại là bắt buộc")
    .regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),
})
.refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Mật khẩu không khớp",
});

export type CreateModeratorSchema = z.infer<typeof createModeratorSchema>;

