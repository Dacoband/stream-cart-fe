import * as z from 'zod';

export const createVoucherSchema = z.object({
  code: z.string().min(1, 'Mã voucher bắt buộc'),
  description: z.string().optional(),
  // explicitly use literal union so TypeScript infers `1 | 2` instead of general `number`
  type: z.union([z.literal(1), z.literal(2)]),
  value: z.number().nonnegative('Giá trị không hợp lệ'),
  maxValue: z.number().nonnegative().optional(),
  minOrderAmount: z.number().nonnegative().optional(),
  startDate: z.string(),
  endDate: z.string(),
  availableQuantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
});

export type CreateVoucherSchema = z.infer<typeof createVoucherSchema>;
