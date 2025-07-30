import { z } from 'zod';
export const createModerator = z.object({
  
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  fullName: z.string().min(1, "Họ và tên đăng nhập là bắt buộc"),

  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Xác nhận mật khẩu là bắt buộc"),
  email: z.string().email("Email không hợp lệ").min(1, "Tên đăng nhập là bắt buộc"),
  avatarUrl: z.string().url("Avatar không hợp lệ").optional(),
  
 phoneNumber: z
  .string()
  .regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),

}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Mật khẩu không khớp",




});

export type CreateModeratorSchema = z.infer<typeof createModerator>;