import { z } from 'zod';

const commonFields = z.object({
  productName: z.string({
    required_error: "Nhập tên sản phẩm",
  }).nonempty("Nhập tên sản phẩm"),

  description: z.string({
    required_error: "Nhập mô tả sản phẩm",
  }).nonempty("Nhập mô tả sản phẩm"),

  sku: z.string({
    required_error: "Nhập SKU sản phẩm",
  }).nonempty("Nhập SKU sản phẩm"),

  categoryId: z.string({
    required_error: "Chọn danh mục cho sản phẩm",
  }).nonempty("Chọn danh mục cho sản phẩm"),

  hasVariant: z.boolean(),
});


const noVariantSchema = commonFields.extend({
  hasVariant: z.literal(false),
  basePrice: z.number({
    required_error: "Nhập giá sản phẩm",
  }).min(0, "Giá sản phẩm phải ≥ 0"),

  stockQuantity: z.number({
    required_error: "Nhập tồn kho",
  }).min(0, "Tồn kho phải ≥ 0"),

  weight: z.number().min(0, "Cân nặng phải ≥ 0"),
  length: z.number().min(0, "Chiều dài phải ≥ 0"),
  width: z.number().min(0, "Chiều rộng phải ≥ 0"),
  height: z.number().min(0, "Chiều cao phải ≥ 0"),
});
const withVariantSchema = commonFields.extend({
  hasVariant: z.literal(true),

  attributes: z.array(
    z.object({
      name: z.string().min(1, "Tên thuộc tính không được rỗng"),
      values: z.array(z.string().min(1, "Giá trị không được để trống")).min(1),
    })
  ).min(1, "Phải có ít nhất 1 thuộc tính"),

  variants: z.array(
    z.object({
      price: z.number().min(0, "Giá phải ≥ 0"),
      stock: z.number().min(0, "Tồn kho phải ≥ 0"),
     attributes: z.array(
        z.object({
          attributeName: z.string().min(1),
          attributeValue: z.string().min(1),
        })
      ).min(1),
   sku: z.string().nonempty("Nhập SKU sản phẩm"),
weight: z.number().min(0, "Cân nặng phải ≥ 0"),
length: z.number().min(0, "Chiều dài phải ≥ 0"),
width: z.number().min(0, "Chiều rộng phải ≥ 0"),
height: z.number().min(0, "Chiều cao phải ≥ 0"),


    })
  ).min(1, "Phải có ít nhất 1 biến thể"),
});
export const creatProductSchema = z.discriminatedUnion("hasVariant", [
  noVariantSchema,
  withVariantSchema,
]);
export type CreateProductSchema = z.infer<typeof creatProductSchema>;
