import { z } from "zod";

// Common fields shared by both types
const commonFields = {
  name: z.string().min(1, "Tên gói không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  price: z.number({ required_error: "Vui lòng nhập giá" }).positive("Giá phải lớn hơn 0"),
  // maxModerator: z
  //   .number({ required_error: "Vui lòng nhập số nhân viên" })
  //   .int()
  //   .positive("Số nhân viên phải > 0"),
  maxLivestream: z
    .number({ required_error: "Vui lòng nhập thời gian" })
    .int()
    .positive("Thời gian live phải lớn hơn 0 "),
};

// Schema for main package (type = 1): duration and commission are required
const mainPackageSchema = z.object({
  type: z.literal(1),
  ...commonFields,
  duration: z.number().int().positive().optional(),
  commission: z
    .number({ required_error: "Vui lòng nhập hoa hồng" })
    .min(0, "Hoa hồng không để trống"),
});

// Schema for renewal package (type = 0): duration and commission are optional
const renewalPackageSchema = z.object({
  type: z.literal(0),
  ...commonFields,
  duration: z.number().int().positive().optional(),
  commission: z.number().min(0).optional(),
});

export const membershipSchema = z.discriminatedUnion("type", [
  mainPackageSchema,
  renewalPackageSchema,
]);

export type MembershipSchema = z.infer<typeof membershipSchema>;
