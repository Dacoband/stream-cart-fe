import { z } from "zod";

export const membershipSchema = z.object({
  name: z.string().min(1, "Tên gói không được để trống"),
  type: z
    .number({ required_error: "Chọn phân loại" })
    .int()
    .min(0, "Chọn phân loại")
    .max(1, "Chọn phân loại"),
  description: z.string().min(1, "Mô tả không được để trống"),
   price: z
    .number({ required_error: "Vui lòng nhập giá" })
    .positive("Giá phải lớn hơn 0"),

  duration: z
    .number({ required_error: "Vui lòng nhập thời lượng" })
    .int()
    .positive("Thời lượng live phải > 0"),

  maxModerator: z
    .number({ required_error: "Vui lòng nhập số nhân viên" })
    .int()
    .positive("Số nhân viên phải > 0"),

  maxLivestream: z
    .number({ required_error: "Vui lòng nhập số livestream" })
    .int()
    .positive("Số livestream phải > 0"),

  commission: z
    .number({ required_error: "Vui lòng nhập hoa hồng" })
    .min(0, "Hoa hồng không để trống"),
});

export type MembershipSchema = z.infer<typeof membershipSchema>;
