"use client";

import React, { useRef, useState } from "react";
import { CreateProductDTO, ProductImage } from "@/types/product/product";
import {
  CreateProductSchema,
  creatProductSchema,
} from "@/components/schema/product_schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createProduct } from "@/services/api/product/product";
import BreadcrumbNewProduct from "../components/BreadcrumbNewProduct";
import { uploadImage } from "@/services/api/uploadImage";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AxiosError } from "axios";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle, ImagePlus, Loader2, Trash } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import SelectCategoryModal from "../components/SelectCategoryModal";
import { Category } from "@/types/category/category";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import HasVariant from "../components/HasVariant";

function NewProductPage() {
  const { user } = useAuth();
  const [productPreviews, setProductPreviews] = useState<string[]>([]);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const productsInputRef = useRef<HTMLInputElement>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [loadingbt, setLoadingbt] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(creatProductSchema),
    defaultValues: { hasVariant: false },
  });
  const watchedHasVariant = form.watch("hasVariant");
  const setHasVariant = (v: boolean) => form.setValue("hasVariant", v);

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryPreview(URL.createObjectURL(file));
    }
  };

  const onproductsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setProductPreviews((prev) => [...prev, ...newPreviews].slice(0, 9));
  };
  const onSubmit = async (data: CreateProductSchema) => {
    console.log("Form data:", data);
    setLoadingbt(true);
    try {
      const imageList: ProductImage[] = [];
      const primaryFile = primaryInputRef.current?.files?.[0];
      if (primaryFile) {
        const { imageUrl } = await uploadImage(primaryFile);
        imageList.push({
          imageUrl,
          isPrimary: true,
          displayOrder: 1,
          altText: data.productName,
        });
      }

      // Upload các ảnh sản phẩm khác
      const productFiles = Array.from(productsInputRef.current?.files || []);
      console.log("productFiles:", productFiles);

      for (let i = 0; i < productFiles.length; i++) {
        const file = productFiles[i];
        const { imageUrl } = await uploadImage(file);
        imageList.push({
          imageUrl,
          isPrimary: false,
          displayOrder: i + 2,
          altText: data.productName,
        });
      }

      if (!user?.shopId) {
        toast.error("Không tìm thấy thông tin người dùng!");
        setLoadingbt(false);
        return;
      }

      const newProduct: CreateProductDTO = data.hasVariant
        ? {
            productName: data.productName,
            description: data.description,
            sku: data.sku,
            categoryId: selectedCategory?.categoryId || "",
            hasVariant: true,
            shopId: user.shopId,
            images: imageList,
            attributes: data.attributes,
            variants: data.variants,
            basePrice: 0,
            stockQuantity: 0,
            weight: 0,
            length: 0,
            width: 0,
            height: 0,
          }
        : {
            productName: data.productName,
            description: data.description,
            sku: data.sku,
            categoryId: selectedCategory?.categoryId || "",
            hasVariant: false,
            shopId: user.shopId,
            images: imageList,
            attributes: [],
            variants: [],
            basePrice: data.basePrice,
            stockQuantity: data.stockQuantity,
            weight: data.weight,
            length: data.length,
            width: data.width,
            height: data.height,
          };

      await createProduct(newProduct);

      toast.success("Cập nhật thành công!");
    } catch (error: unknown) {
      console.error("Update user failed:", error);
      const err = error as AxiosError<{ message?: string }>;
      const messages = err?.response?.data?.message ?? "Cập nhật thất bại!";
      toast.error(messages);
    } finally {
      setLoadingbt(false);
    }
  };
  const handleRemoveImage = (indexToRemove: number) => {
    setProductPreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    form.setValue("categoryId", category.categoryId);
    setCategoryModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5  min-h-full">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <BreadcrumbNewProduct />
      </div>
      <div className=" w-[90%] mx-auto ">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("Form errors:", errors); // Xem lỗi validate nếu có
              toast.error("Vui lòng kiểm tra lại thông tin sản phẩm!");
            })}
            className="flex flex-col gap-5 mx-5 mb-10"
          >
            <Card className="bg-white py-5 px-8 rounded-sm">
              <CardTitle className="text-xl font-medium">
                Thông tin cơ bản
              </CardTitle>
              <CardContent className="p-0 space-y-6">
                <div className="  w-full ">
                  <Label className="text-black text-base font-medium mb-2">
                    <div className="text-red-500 text-lg">*</div>Ảnh bìa sản
                    phẩm:
                  </Label>
                  <div className="w-full flex gap-8">
                    <button
                      type="button"
                      onClick={() => primaryInputRef.current?.click()}
                      className="w-fit h-fit cursor-pointer"
                    >
                      <div className="w-32 h-32 border border-dashed rounded-sm border-gray-400 relative bg-white">
                        {primaryPreview ? (
                          <Image
                            src={primaryPreview}
                            alt="Avatar"
                            fill
                            className="object-contain object-center"
                          />
                        ) : (
                          <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                            <ImagePlus className="w-8 h-8 mb-1 text-red-400" />
                            <span className="text-xs">(0/1)</span>
                          </div>
                        )}
                        <input
                          ref={primaryInputRef}
                          type="file"
                          accept="image/*"
                          onChange={onLogoChange}
                          className="hidden"
                        />
                      </div>
                    </button>

                    <ul className="text-sm text-gray-500 list-disc pl-5">
                      <li>
                        Tải lên hình ảnh có tỉ lệ 1:1 để có ảnh sản phẩm đẹp
                        nhất.
                      </li>
                      <li>
                        Ảnh bìa sẽ được hiển thị tại các trang Kết quả tìm kiếm,
                        Gợi ý hôm nay,... Việc sử dụng ảnh bìa đẹp sẽ thu hút
                        thêm lượt truy cập vào sản phẩm của bạn.
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="w-full gap-2 flex flex-col">
                  <Label className="text-black text-base  font-medium ">
                    <div className="text-red-500 text-lg">*</div>Ảnh bìa sản
                    phẩm:
                  </Label>
                  <ul className="text-sm text-gray-500 list-disc pl-5">
                    <li>
                      Tải lên hình ảnh có tỉ lệ 1:1 để có ảnh sản phẩm đẹp nhất.
                    </li>
                  </ul>

                  <div className="flex flex-row gap-3 flex-wrap">
                    {productPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="w-32 h-32 border border-dashed rounded-sm border-gray-400 relative group bg-white overflow-hidden"
                      >
                        <Image
                          src={preview}
                          alt={`Ảnh sản phẩm ${index + 1}`}
                          fill
                          className="object-contain object-center"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute bottom-0 w-full  p-2 bg-black/60 rounded-none cursor-pointer  hidden group-hover:block transition"
                        >
                          <Trash className="w-4 h-4 text-white mx-auto" />
                        </button>
                      </div>
                    ))}

                    {productPreviews.length < 9 && (
                      <button
                        type="button"
                        onClick={() => productsInputRef.current?.click()}
                        className="w-fit h-fit cursor-pointer"
                      >
                        <div className="w-32 h-32 border border-dashed rounded-sm border-gray-400 relative bg-white">
                          <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                            <ImagePlus className="w-8 h-8 mb-1 text-red-400" />
                            <span className="text-xs">
                              ({productPreviews.length}/9)
                            </span>
                          </div>
                        </div>
                      </button>
                    )}

                    <input
                      ref={productsInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onproductsChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        <div className="text-red-500 text-lg">*</div>Tên sản
                        phẩm
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="username"
                          className="bg-white text-black rounded-none"
                          placeholder="Nhập tên sản phẩm (Tên sản phẩm + Thương hiệu + Model)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        <div className="text-red-500 text-lg">*</div>Danh mục
                        sản phẩm
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="sku"
                          className="bg-white text-black rounded-none"
                          placeholder="Nhập mã SKU"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base">
                        <div className="text-red-500 text-lg">*</div>Chọn ngành
                        hàng
                      </FormLabel>
                      <FormControl>
                        <div
                          onClick={() => setCategoryModalOpen(true)}
                          className="bg-white text-black border border-input rounded-none px-3 py-2 cursor-pointer"
                        >
                          {selectedCategory?.categoryName || "Chọn ngành hàng"}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        <div className="text-red-500 text-lg">*</div>Mô tả sản
                        phẩm
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả"
                          className="resize-none min-h-56"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <HasVariant
              watchedHasVariant={watchedHasVariant}
              setHasVariant={setHasVariant}
              form={form}
              attributes={form.watch("attributes") || []}
            />

            <div className="bg-white sticky  bottom-0  z-10 h-fit w-full py-3 px-5 shadow border flex justify-between items-center">
              <div className="w-[90%] flex justify-end mx-auto gap-5">
                <Button
                  type="submit"
                  className="px-8 font-normal py-2 h-full bg-white hover:bg-white border-2 text-black hover:text-black/50 text-base cursor-pointer"
                >
                  Thoát
                </Button>
                <Button
                  type="submit"
                  className="px-8 h-full py-2 font-normal bg-[#B0F847] hover:bg-[#B0F847]/80 text-black hover:text-black/50 text-base cursor-pointer"
                  disabled={loadingbt}
                >
                  {loadingbt ? (
                    <>
                      <Loader2 className="animate-spin mr-1" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-1" />
                      Tạo sản phẩm
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <SelectCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSelect={handleSelectCategory}
        initialSelectedCategoryId={selectedCategory?.categoryId}
      />
    </div>
  );
}

export default NewProductPage;
