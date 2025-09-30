import * as z from 'zod';

export const createVoucherSchema = z.object({
  code: z.string().min(1, 'Mã voucher bắt buộc'),
  description: z.string().optional(),
  type: z.union([z.literal(1), z.literal(2)]),
 value: z.coerce.number().positive("Giá trị phải lớn hơn 0"),

  maxValue: z.coerce.number().nonnegative().optional(),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  startDate: z.coerce.date(),  // ép string -> Date
  endDate: z.coerce.date(), 
  availableQuantity: z.coerce.number().int().positive('Số lượng phải lớn hơn 0'),
  
}).refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"], 
    }
  ) .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    }
  );;
  
;

export type CreateVoucherSchema = z.infer<typeof createVoucherSchema>;
export const updateVoucherSchema = z
  .object({
    description: z.string().optional(),

   value: z.coerce.number().positive("Giá trị phải lớn hơn 0"),

    maxValue: z.coerce.number().nonnegative().optional(),
    minOrderAmount: z.coerce.number().nonnegative().optional(),

 startDate: z.coerce.date(),  // ép string -> Date
  endDate: z.coerce.date(), 

    availableQuantity: z.coerce
      .number()
      .int()
      .positive("Số lượng phải lớn hơn 0"),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"], 
    }
  );

export type UpdateVoucherSchema = z.infer<typeof updateVoucherSchema>;