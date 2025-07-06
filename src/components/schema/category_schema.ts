import { z } from 'zod'

export const createCategorySchema = z.object({
  categoryName: z.string().min(1, 'Tên danh mục không được để trống'),
  description: z.string().max(250, 'Mô tả tối đa 250 ký tự').optional(),
  iconURL: z.string().url('URL icon không hợp lệ').optional().or(z.literal('')),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, 'Slug chỉ chứa chữ thường, số, gạch ngang')
    .optional()
    .or(z.literal('')),
  parentCategoryID: z.string().optional().or(z.literal('')),
})

export type CreateCategorySchema = z.infer<typeof createCategorySchema>
