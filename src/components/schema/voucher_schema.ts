import * as z from 'zod';

export const createVoucherSchema = z.object({
  code: z.string().min(1, 'Mã voucher bắt buộc'),
  description: z.string().optional(),
  type: z.union([z.literal(1), z.literal(2)]),
  value: z.coerce.number().nonnegative('Giá trị không hợp lệ'),
  maxValue: z.coerce.number().nonnegative().optional(),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  startDate: z.string(),
  endDate: z.string(),
  availableQuantity: z.coerce.number().int().positive('Số lượng phải lớn hơn 0'),
});

export type CreateVoucherSchema = z.infer<typeof createVoucherSchema>;
