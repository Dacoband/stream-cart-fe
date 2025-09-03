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
      price: z.number().min(0, "Giá phải ≥ 0").nullable(),
      stock: z.number().min(0, "Tồn kho phải ≥ 0").nullable(),
      attributes: z.array(
        z.object({
          attributeName: z.string().min(1),
          attributeValue: z.string().min(1),
        })
      ).min(1),
   sku: z.string().nonempty("Nhập SKU sản phẩm"),
weight: z.number().min(0, "Cân nặng phải ≥ 0").nullable(),
length: z.number().min(0, "Chiều dài phải ≥ 0").nullable(),
width: z.number().min(0, "Chiều rộng phải ≥ 0").nullable(),
height: z.number().min(0, "Chiều cao phải ≥ 0").nullable(),


    })
  ).min(1, "Phải có ít nhất 1 biến thể"),
});
export const creatProductSchema = z.discriminatedUnion("hasVariant", [
  noVariantSchema,
  withVariantSchema,
]);
export type CreateProductSchema = z.infer<typeof creatProductSchema>;

export const updateProductSchema = z
  .object({
    productName: z.string().min(1, "Tên sản phẩm không được rỗng").optional(),
    description: z.string().min(1, "Mô tả không được rỗng").optional(),
    sku: z.string().min(1, "SKU không được rỗng").optional(),
    categoryId: z.string().min(1, "Danh mục không được rỗng").optional(),
    basePrice: z.number().min(0, "Giá phải ≥ 0").optional(),
    discountPrice: z.number().min(0, "Giá khuyến mãi phải ≥ 0").optional(),
    weight: z.number().min(0, "Cân nặng phải ≥ 0").optional(),
    length: z.number().min(0, "Chiều dài phải ≥ 0").optional(),
    width: z.number().min(0, "Chiều rộng phải ≥ 0").optional(),
    height: z.number().min(0, "Chiều cao phải ≥ 0").optional(),
    hasVariant: z.boolean().optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some(
        (v) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")
      ),
    {
      message: "Cần ít nhất một trường để cập nhật",
      path: ["_base"],
    }
  );

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;


// Cập nhật Product Attribute (name)
export const updateProductAttributeSchema = z.object({
  name: z.string().min(1, "Tên thuộc tính không được rỗng").optional(),
}).refine(
  (d) => Object.values(d).some((v) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")),
  { message: "Cần ít nhất một trường để cập nhật", path: ["_base"] }
);
export type UpdateProductAttributeSchema = z.infer<typeof updateProductAttributeSchema>;

// Cập nhật Attribute Value (valueName)
export const updateAttributeValueSchema = z.object({
  valueName: z.string().min(1, "Giá trị không được rỗng").optional(),
}).refine(
  (d) => Object.values(d).some((v) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")),
  { message: "Cần ít nhất một trường để cập nhật", path: ["_base"] }
);
export type UpdateAttributeValueSchema = z.infer<typeof updateAttributeValueSchema>;

// Cập nhật Product Variant
export const updateProductVariantSchema = z.object({
  sku: z.string().min(1, "SKU không được rỗng").optional(),
  price: z.number().min(0, "Giá ≥ 0").optional(),
  flashSalePrice: z.number().min(0, "Giá flash sale ≥ 0").optional(),
  stock: z.number().min(0, "Tồn kho ≥ 0").optional(),
  weight: z.number().min(0, "Cân nặng ≥ 0").optional(),
  length: z.number().min(0, "Chiều dài ≥ 0").optional(),
  width: z.number().min(0, "Chiều rộng ≥ 0").optional(),
  height: z.number().min(0, "Chiều cao ≥ 0").optional(),
}).refine(
  (d) => Object.values(d).some((v) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")),
  { message: "Cần ít nhất một trường để cập nhật", path: ["_base"] }
);
export type UpdateProductVariantSchema = z.infer<typeof updateProductVariantSchema>;

// Cập nhật Product Image
export const updateProductImageSchema = z.object({
  isPrimary: z.boolean().optional(),
  displayOrder: z.number().min(0, "Thứ tự ≥ 0").optional(),
  altText: z.string().optional(),
}).refine(
  (d) => Object.values(d).some((v) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")),
  { message: "Cần ít nhất một trường để cập nhật", path: ["_base"] }
);
export type UpdateProductImageSchema = z.infer<typeof updateProductImageSchema>;

// Cập nhật tồn kho Product (thay đổi cộng/trừ)
export const updateProductStockSchema = z.object({
  quantityChange: z.number().refine((v) => v !== 0, { message: "quantityChange phải khác 0" }),
});
export type UpdateProductStockSchema = z.infer<typeof updateProductStockSchema>;

// Cập nhật tồn kho Product Variant (thiết lập tuyệt đối)
export const updateProductVariantStockSchema = z.object({
  quantity: z.number().min(0, "Tồn kho ≥ 0"),
});
export type UpdateProductVariantStockSchema = z.infer<typeof updateProductVariantStockSchema>;
