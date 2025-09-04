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

// Schema for main package (type = 1): duration optional, commission is required and must be in (0,100)
const mainPackageSchema = z.object({
  type: z.literal(1),
  ...commonFields,
  duration: z.number().int().positive().optional(),
  commission: z
    .number({ required_error: "Vui lòng nhập hoa hồng" })
    .gt(0, "Hoa hồng phải lớn hơn 0")
    .lt(100, "Hoa hồng phải nhỏ hơn 100"),
});

// Schema for renewal package (type = 0): duration optional, commission defaults to 0 and must be 0
const renewalPackageSchema = z.object({
  type: z.literal(0),
  ...commonFields,
  duration: z.number().int().positive().optional(),
  commission: z.number().int().min(0).max(0).default(0),
});

export const membershipSchema = z.discriminatedUnion("type", [
  mainPackageSchema,
  renewalPackageSchema,
]);

// Output type (after parsing/defaults applied) - domain shape
export type MembershipSchema = z.infer<typeof membershipSchema>;
// Input type (before parsing) - suitable for react-hook-form values
export type MembershipFormValues = z.input<typeof membershipSchema>;
