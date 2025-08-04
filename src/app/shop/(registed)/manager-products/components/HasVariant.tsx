import React, { useState, useEffect } from "react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { ProductAttribute } from "@/types/product/product";
import { CreateProductSchema } from "@/components/schema/product_schema";
import { UseFormReturn } from "react-hook-form";
function generateVariantCombinations(
  attributes: ProductAttribute[]
): string[][] {
  if (attributes.length === 0) return [];
  if (attributes.length === 1) {
    return attributes[0].values.map((v) => [v]);
  }
  if (attributes.length === 2) {
    const combinations: string[][] = [];
    for (const val1 of attributes[0].values) {
      for (const val2 of attributes[1].values) {
        combinations.push([val1, val2]);
      }
    }
    return combinations;
  }
  return [];
}

interface HasVariantProps {
  watchedHasVariant: boolean;
  setHasVariant: (v: boolean) => void;
  form: UseFormReturn<CreateProductSchema>;
  attributes: ProductAttribute[];
}

const HasVariant: React.FC<HasVariantProps> = ({
  watchedHasVariant,
  setHasVariant,
  form,
  attributes,
}) => {
  const [attributeError, setAttributeError] = useState<string | null>(null);
  const [valueErrors, setValueErrors] = useState<Record<number, string | null>>(
    {}
  );

  useEffect(() => {
    const watchedAttributes = form.watch("attributes") || [];
    const combinations = generateVariantCombinations(watchedAttributes);
    const prevVariants = form.getValues("variants") || [];
    const newVariants = combinations.map((combo) => {
      const prev = prevVariants.find(
        (v) =>
          v.attributes &&
          v.attributes.length === combo.length &&
          v.attributes.every((attr, idx) => attr.attributeValue === combo[idx])
      );
      return {
        attributes: watchedAttributes.map((attr, idx) => ({
          attributeName: attr.name,
          attributeValue: combo[idx] ?? "",
        })),
        sku: prev?.sku ?? "",
        price: prev?.price ?? 0,
        stock: prev?.stock ?? 0,
        weight: prev?.weight ?? 0,
        length: prev?.length ?? 0,
        width: prev?.width ?? 0,
        height: prev?.height ?? 0,
      };
    });
    form.setValue("variants", newVariants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(form.watch("attributes"))]);

  return (
    <>
      <Card className="bg-white pt-5 pb-8 px-8  rounded-sm">
        <CardTitle className="text-xl font-medium">
          Thông tin bán hàng
        </CardTitle>
        <CardContent className="p-0 space-y-6">
          <div className="flex gap-5">
            <FormLabel className="text-base">
              <div className="text-red-500 text-lg">*</div>Sản phẩm:
            </FormLabel>
            <Button
              type="button"
              onClick={() => {
                setHasVariant(false);
                form.setValue("hasVariant", false);
              }}
              className={`border-2  cursor-pointer bg-white hover:bg-white ${
                !watchedHasVariant
                  ? "text-lime-600 border-lime-600 font-semibold"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              Không có phân loại
            </Button>
            <Button
              type="button"
              onClick={() => {
                setHasVariant(true);
                form.setValue("hasVariant", true);
                // Khởi tạo attributes nếu chưa có
                if (
                  !form.watch("attributes") ||
                  form.watch("attributes").length === 0
                ) {
                  form.setValue("attributes", [{ name: "", values: [""] }]);
                }
              }}
              className={`border-2  cursor-pointer bg-white hover:bg-white ${
                watchedHasVariant
                  ? "text-lime-600 border-lime-600 font-semibold"
                  : "text-gray-500 border-gray-300"
              }`}
            >
              Có phân loại
            </Button>
          </div>

          {watchedHasVariant === false && (
            <div className="grid grid-cols-2 gap-10">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      <div className="text-red-500 text-lg">*</div>Giá sản phẩm:
                    </FormLabel>
                    <div className="relative ">
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          className="bg-white pl-14 text-black rounded-none"
                        />
                      </FormControl>
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 text-sm border-r px-4 boder-2">
                        đ
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      <div className="text-red-500 text-lg">*</div> Số lượng
                      trong kho:
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          className="bg-white text-black rounded-none"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          {watchedHasVariant === true && (
            <>
              {/* Attributes block */}
              <div className="space-y-6">
                <FormLabel className="text-base">
                  <span className="text-red-500">*</span> Phân loại sản phẩm{" "}
                  <span className="text-gray-500 text-sm flex justify-end items-end">
                    (Tối đa hai phân loại)
                  </span>
                </FormLabel>

                {form.watch("attributes")?.map((attr, attrIndex) => (
                  <div key={attrIndex} className="relative">
                    <div className="border p-4 space-y-2 rounded-sm bg-gray-50">
                      {/* Nút Xóa phân loại */}
                      {form.watch("attributes").length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedAttrs = [
                              ...form.watch("attributes"),
                            ].filter((_attr, i) => i !== attrIndex);
                            form.setValue("attributes", updatedAttrs);
                          }}
                          className="absolute top-2 right-2 text-red-500"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}

                      {/* Tên phân loại */}
                      <FormField
                        control={form.control}
                        name={`attributes.${attrIndex}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phân loại {attrIndex + 1}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Tên phân loại. Ví dụ: Màu sắc, kích thước,...."
                                className="bg-white rounded-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Các giá trị */}
                      <div className="grid grid-cols-3 gap-5 mt-2">
                        {attr.values.map((value: string, valIndex: number) => (
                          <div
                            key={valIndex}
                            className="flex items-center gap-2"
                          >
                            <FormField
                              control={form.control}
                              name={`attributes.${attrIndex}.values.${valIndex}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={`Giá trị ${valIndex + 1}`}
                                      className="bg-white rounded-none"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {attr.values.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const currentAttrs = [
                                    ...form.watch("attributes"),
                                  ];
                                  currentAttrs[attrIndex].values.splice(
                                    valIndex,
                                    1
                                  );
                                  form.setValue("attributes", currentAttrs);
                                }}
                                className="ml-1"
                              >
                                <Trash className="text-red-500 w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Thêm giá trị phân loại */}
                      <div className="space-y-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const currentAttrs = [...form.watch("attributes")];
                            const isAllFilled = currentAttrs[
                              attrIndex
                            ].values.every((val: string) => val.trim() !== "");
                            if (!isAllFilled) {
                              setValueErrors((prev) => ({
                                ...prev,
                                [attrIndex]:
                                  "Vui lòng điền hết giá trị trước khi thêm mới.",
                              }));
                              return;
                            }
                            setValueErrors((prev) => ({
                              ...prev,
                              [attrIndex]: null,
                            }));
                            currentAttrs[attrIndex].values.push("");
                            form.setValue("attributes", currentAttrs);
                          }}
                        >
                          + Thêm giá trị của phân loại
                        </Button>
                        {valueErrors[attrIndex] && (
                          <p className="text-sm text-red-500">
                            {valueErrors[attrIndex]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {form.watch("attributes")?.length < 2 && (
                  <div className="space-y-1">
                    <Button
                      className="mt-2"
                      type="button"
                      variant="default"
                      onClick={() => {
                        const currentAttrs = form.watch("attributes") || [];
                        const isAllNameFilled = currentAttrs.every(
                          (attr) => attr.name.trim() !== ""
                        );
                        if (!isAllNameFilled) {
                          setAttributeError(
                            "Vui lòng nhập tên tất cả phân loại trước khi thêm mới."
                          );
                          return;
                        }
                        setAttributeError(null);
                        form.setValue("attributes", [
                          ...currentAttrs,
                          { name: "", values: [""] },
                        ]);
                      }}
                    >
                      + Thêm phân loại
                    </Button>
                    {attributeError && (
                      <p className="text-sm text-red-500">{attributeError}</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="bg-white  pt-5 pb-8 px-8 rounded-sm">
        <CardTitle className="text-xl font-medium">Vận chuyển</CardTitle>
        <CardContent className="p-0 space-y-6">
          {watchedHasVariant === false && (
            <>
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      <span className="text-red-500 mr-1">*</span>
                      Cân nặng (Sau khi đóng gói)
                    </FormLabel>
                    <div className="relative w-1/3">
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          className="bg-white text-black pr-10 rounded-none"
                          placeholder="Nhập vào"
                        />
                      </FormControl>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm border-l pl-4 boder-2">
                        gr
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel className="text-base mb-2">
                  <span className="text-red-500 mr-1">*</span>
                  Kích thước đóng gói{" "}
                  <span className="text-sm text-gray-600">
                    (Phí vận chuyển thực tế sẽ thay đổi nếu bạn nhập sai kích
                    thước)
                  </span>
                </FormLabel>

                <div className="flex items-center gap-4 justify-between">
                  {/* R */}
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem className="relative w-1/3">
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            placeholder="R"
                            className="bg-white text-black pr-8 rounded-none"
                          />
                        </FormControl>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm border-l pl-4 boder-2">
                          cm
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <span className="text-xl text-gray-500 ">×</span>

                  {/* D */}
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem className="relative w-1/3">
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            placeholder="D"
                            className="bg-white text-black pr-8 rounded-none"
                          />
                        </FormControl>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm border-l pl-4 boder-2">
                          cm
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <span className="text-xl text-gray-500 ">×</span>

                  {/* C */}
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem className="relative w-1/3">
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            placeholder="C"
                            className="bg-white text-black pr-8 rounded-none"
                          />
                        </FormControl>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm border-l pl-4 boder-2">
                          cm
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </>
          )}
          {watchedHasVariant && attributes.length > 0 && (
            <div className="overflow-auto border rounded-sm">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {attributes.map((attr, index) => (
                      <th
                        key={index}
                        className="border p-2 font-medium text-left min-w-[100px]"
                      >
                        {attr.name || `Phân loại ${index + 1}`}
                      </th>
                    ))}
                    <th className="border p-1">SKU</th>
                    <th className="border p-1">Giá (VNĐ)</th>
                    <th className="border p-1">Kho hàng</th>

                    <th className="border p-1">Cân nặng (gr)</th>
                    <th className="border p-1">Dài (cm)</th>
                    <th className="border p-1">Rộng (cm)</th>
                    <th className="border p-1">Cao (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {form.watch("variants")?.map((variant, index) => (
                    <tr key={index} className="bg-white">
                      {variant.attributes.map((attr, idx) => (
                        <td key={idx} className="border w-[180px] p-2">
                          {attr.attributeValue}
                        </td>
                      ))}

                      <td className="border p-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.sku`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="sku"
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>

                      <td className="border p-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === ""
                                        ? undefined
                                        : e.target.valueAsNumber
                                    );
                                  }}
                                  className="w-full"
                                  placeholder="đ"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>

                      <td className="border p-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.stock`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === ""
                                        ? undefined
                                        : e.target.valueAsNumber
                                    );
                                  }}
                                  className="w-full"
                                  placeholder="Kho"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>

                      <td className="border p-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.weight`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === ""
                                        ? undefined
                                        : e.target.valueAsNumber
                                    );
                                  }}
                                  min={0}
                                  className="w-full"
                                  placeholder="gr"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>

                      <td className="border p-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.length`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === ""
                                        ? undefined
                                        : e.target.valueAsNumber
                                    );
                                  }}
                                  className="w-full"
                                  placeholder="Dài"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>

                      <td className="border p-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.width`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === ""
                                        ? undefined
                                        : e.target.valueAsNumber
                                    );
                                  }}
                                  className="w-full"
                                  placeholder="Rộng"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>

                      <td className="border p-2">
                        <FormField
                          control={form.control}
                          name={`variants.${index}.height`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === ""
                                        ? undefined
                                        : e.target.valueAsNumber
                                    );
                                  }}
                                  className="w-full"
                                  placeholder="Cao"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default HasVariant;
