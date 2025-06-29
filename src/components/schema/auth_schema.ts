// app/login/schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export const registerSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  fullName: z.string().min(1, "Tên đăng nhập là bắt buộc"),

  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Xác nhận mật khẩu là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Tên đăng nhập là bắt buộc"),
  avatarUrl: z.string().url("Avatar không hợp lệ").optional(),
  role: z.string().min(1, "Vai trò là bắt buộc"),
  phonenumber: z.string().min(8, "Số điện thoại không hợp lệ"),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Mật khẩu không khớp",
});
export type RegisterSchema = z.infer<typeof registerSchema>;

