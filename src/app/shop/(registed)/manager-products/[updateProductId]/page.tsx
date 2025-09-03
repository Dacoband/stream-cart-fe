"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  updateProductSchema,
  UpdateProductSchema,
} from "@/components/schema/product_schema";
import { getProductDetailById, updateProduct, updateStockProductById } from "@/services/api/product/product";
import { updateProductAttribute, getProductAttributeByProductId } from "@/services/api/product/productAttribute";
import { updateAttributeValue } from "@/services/api/product/attributeValue";
import { updateProductVariant, updateStockProductVariant, getVarriantByProductId } from "@/services/api/product/productVarriant";
import { updateProductImage } from "@/services/api/product/ProductImage";
import { deleteProductImage, getImageProductByProductId, createProductImage } from "@/services/api/product/ProductImage";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft, ImagePlus, Trash } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import SelectCategoryModal from "../components/SelectCategoryModal";
import { Category } from "@/types/category/category";
import { getCategoryById } from "@/services/api/categories/categorys";
import { uploadImage } from "@/services/api/uploadImage";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
// import { useAuth } from "@/lib/AuthContext"; // hiện chưa cần user cụ thể

interface ProductImageType { id:string; imageUrl:string; isPrimary:boolean; displayOrder:number; altText?:string; variantId?:string | null }
interface AttributeValue { id:string; valueName:string; attributeId:string }
interface Attribute { id:string; name:string; values:AttributeValue[] }
interface Variant { id:string; sku?:string; price?:number; flashSalePrice?:number; stock?:number; weight?:number; length?:number; width?:number; height?:number; attributes?:{attributeName:string; attributeValue:string}[] }

export default function UpdateProductPage() {
  const params = useParams<{ updateProductId: string }>();
  const productId = params.updateProductId;
  // const router = useRouter();
  // const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingBasic, setSavingBasic] = useState(false);
  interface ProductDetailShape extends UpdateProductSchema {
    id: string;
    discountPrice?: number;
    stockQuantity?: number;
    images?: ProductImageType[];
    attributes?: Attribute[];
    variants?: Variant[];
  }
  const [productOriginal, setProductOriginal] = useState<ProductDetailShape | null>(null);
  const [images, setImages] = useState<ProductImageType[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [stockChange, setStockChange] = useState<string>("0");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
  const [productPreviews, setProductPreviews] = useState<string[]>([]);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingProducts, setUploadingProducts] = useState(false);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const productsInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateProductSchema>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {},
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const detail = await getProductDetailById(productId);
      console.log("Product detail from API:", detail);
      
      setProductOriginal(detail);
      
      // Load images separately
      try {
        const imageData = await getImageProductByProductId(productId);
        console.log("Images from API:", imageData);
        setImages(imageData || []);
      } catch (imgError) {
        console.log("No images or error loading images:", imgError);
        if (detail.primaryImage && detail.primaryImage.length > 0) {
          const convertedImages = detail.primaryImage.map((url: string, index: number) => ({
            id: `primary-${index}`,
            imageUrl: url,
            isPrimary: index === 0,
            displayOrder: index,
            altText: ""
          }));
          setImages(convertedImages);
        } else {
          setImages([]);
        }
      }
      
      // Load attributes separately
      try {
        const attributeData = await getProductAttributeByProductId(productId);
        console.log("Attributes from API:", attributeData);
        setAttributes(attributeData || []);
      } catch (attrError) {
        console.log("No attributes or error loading attributes:", attrError);
        setAttributes([]);
      }
      
      // Load variants separately
      try {
        const variantData = await getVarriantByProductId(productId);
        console.log("Variants from API:", variantData);
        setVariants(variantData || []);
      } catch (varError) {
        console.log("No variants or error loading variants:", varError);
        setVariants([]);
      }

      setPrimaryPreview(null);
      setProductPreviews([]);
      if (detail.categoryId) {
        try {
          const cat = await getCategoryById(detail.categoryId);
          setSelectedCategory(cat);
        } catch {
        }
      }
      form.reset({
        productName: detail.productName,
        description: detail.description,
        sku: detail.sku,
        categoryId: detail.categoryId,
        basePrice: detail.basePrice,
        discountPrice: detail.discountPrice,
        weight: detail.weight,
        length: detail.length,
        width: detail.width,
        height: detail.height,
        hasVariant: detail.hasVariant || false,
      });
  } catch (e) {
      console.error("Error loading product:", e);
      toast.error("Tải sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  }, [productId, form]);

  useEffect(() => { load(); }, [load]);

  const onSubmitBasic = async (data: UpdateProductSchema) => {
    if (!productOriginal) return;
    setSavingBasic(true);
    try {
  const changed: Record<string, unknown> = {};
      Object.entries(data).forEach(([k, v]) => {
        const currentVal = (productOriginal as unknown as Record<string, unknown>)[k];
        if (v !== undefined && v !== currentVal) {
          changed[k] = v;
        }
      });
      if (Object.keys(changed).length === 0) {
        toast.info("Không có thay đổi");
      } else {
        await updateProduct(productId, changed);
        toast.success("Cập nhật cơ bản thành công");
      }
  } catch (e) {
      console.error(e);
      toast.error("Cập nhật thất bại");
    } finally { setSavingBasic(false); }
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    form.setValue("categoryId", category.categoryId, { shouldDirty: true });
    setCategoryModalOpen(false);
  };

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingPrimary(true);
      const { imageUrl } = await uploadImage(file);
      
      // Create new product image as primary
      await createProductImage({
        productId,
        imageUrl,
        variantId: null,
        isPrimary: true,
        displayOrder: 0,
        altText: ""
      });
      const updatedImages = await getImageProductByProductId(productId);
      setImages(updatedImages || []);
      setPrimaryPreview(null);
      toast.success("Thêm ảnh bìa thành công");
    } catch (error) {
      console.error("Error uploading primary image:", error);
      toast.error("Lỗi upload ảnh bìa");
    } finally {
      setUploadingPrimary(false);
    }
  };

  const onproductsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    try {
      setUploadingProducts(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const { imageUrl } = await uploadImage(file);

          await createProductImage({
            productId,
            imageUrl,
            variantId: null,
            isPrimary: false,
            displayOrder: images.length + i + 1,
            altText: ""
          });
        } catch (error) {
          console.error(`Error uploading image ${i + 1}:`, error);
          toast.error(`Lỗi upload ảnh ${i + 1}`);
        }
      }
      
      // Reload images
      const updatedImages = await getImageProductByProductId(productId);
      setImages(updatedImages || []);
      
      // Clear previews
      setProductPreviews([]);
      toast.success(`Thêm ${files.length} ảnh thành công`);
    } catch (error) {
      console.error("Error uploading product images:", error);
      toast.error("Lỗi upload ảnh sản phẩm");
    } finally {
      setUploadingProducts(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setProductPreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleUpdateAttributeName = async (attr: Attribute, newName: string) => {
    if (newName.trim() === '' || newName === attr.name) return;
    try {
      await updateProductAttribute(attr.id, { name: newName });
      setAttributes(prev => prev.map(a => a.id === attr.id ? { ...a, name: newName } : a));
      toast.success("Đổi tên thuộc tính");
    } catch { toast.error("Lỗi cập nhật thuộc tính"); }
  };

  const handleUpdateAttributeValue = async (val: AttributeValue, newValue: string) => {
    if (newValue.trim() === '' || newValue === val.valueName) return;
    try {
      await updateAttributeValue(val.id, { valueName: newValue });
      setAttributes(prev => prev.map(a => a.id === val.attributeId ? { ...a, values: a.values.map(v => v.id === val.id ? { ...v, valueName: newValue } : v) } : a));
      toast.success("Đổi giá trị");
    } catch { toast.error("Lỗi cập nhật giá trị"); }
  };

  const handleUpdateVariant = async (variant: Variant, fields: Partial<Variant>) => {
    try {
  const changed: Record<string, unknown> = {};
      Object.entries(fields).forEach(([k,v]) => {
        const currentVal = (variant as unknown as Record<string, unknown>)[k];
        if (v !== currentVal) changed[k] = v;
      });
      if (Object.keys(changed).length === 0) { toast.info("Không có thay đổi"); return; }
      await updateProductVariant(variant.id, changed);
      setVariants(prev => prev.map(v => v.id === variant.id ? { ...v, ...changed } : v));
      toast.success("Cập nhật biến thể");
    } catch { toast.error("Lỗi cập nhật biến thể"); }
  };

  const handleUpdateVariantStock = async (variant: Variant, newStock: number) => {
    try {
      if (newStock < 0) { toast.error("Stock ≥ 0"); return; }
      await updateStockProductVariant(variant.id, { quantity: newStock });
      setVariants(prev => prev.map(v => v.id === variant.id ? { ...v, stock: newStock } : v));
      toast.success("Cập nhật tồn kho biến thể");
    } catch { toast.error("Lỗi cập nhật tồn kho biến thể"); }
  };

  const handleUpdateProductStock = async () => {
    if (!productOriginal) return;
    const num = Number(stockChange);
    if (Number.isNaN(num) || num === 0) { toast.error("Nhập số khác 0"); return; }
    try {
      await updateStockProductById(productId, { quantityChange: num });
  setProductOriginal((p) => (p ? { ...p, stockQuantity: (p.stockQuantity || 0) + num } : p));
      toast.success("Điều chỉnh tồn kho");
      setStockChange("0");
    } catch { toast.error("Lỗi điều chỉnh tồn kho"); }
  };

  const handleUpdateImage = async (img: ProductImageType, patch: Partial<ProductImageType>) => {
    try {
      await updateProductImage(img.id, patch);
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, ...patch } : i));
      toast.success("Cập nhật ảnh");
    } catch { toast.error("Lỗi cập nhật ảnh"); }
  };

  const handleUpdateImageWithUpload = async (img: ProductImageType, file: File) => {
    try {
      // Upload new image
      const uploadResult = await uploadImage(file);
      const imageUrl = uploadResult.data.url;
      
      // Update the image URL
      await updateProductImage(img.id, { imageUrl });
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, imageUrl } : i));
      toast.success("Cập nhật ảnh thành công");
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Lỗi cập nhật ảnh");
    }
  };

  const handleSetPrimaryImage = async (img: ProductImageType) => {
    if (img.isPrimary) return;
    // set selected primary true, others false (fire sequential updates)
    for (const i of images) {
      const targetState = i.id === img.id;
      if (i.isPrimary !== targetState) {
        try { await updateProductImage(i.id, { isPrimary: targetState }); } catch {}
      }
    }
    setImages(prev => prev.map(i => ({ ...i, isPrimary: i.id === img.id })));
    toast.success("Đặt ảnh chính");
  };

  const handleDeleteImage = async (img: ProductImageType) => {
    if (img.isPrimary) {
      toast.error("Không thể xóa ảnh chính");
      return;
    }
    try {
      await deleteProductImage(img.id);
      setImages(prev => prev.filter(i => i.id !== img.id));
      toast.success("Xóa ảnh thành công");
    } catch {
      toast.error("Lỗi xóa ảnh");
    }
  };

  if (loading) return <div className="p-8 flex gap-2 items-center text-sm text-gray-600"><Loader2 className="animate-spin w-4 h-4"/> Đang tải sản phẩm...</div>;
  if (!productOriginal) return <div className="p-8">Không tìm thấy sản phẩm</div>;

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="bg-white sticky top-0 z-10 py-3 px-6 shadow flex items-center gap-4">
        <Link href="/shop/manager-products" className="text-sm flex items-center gap-1 text-blue-600"><ArrowLeft className="w-4 h-4"/>Quay lại</Link>
        <h1 className="font-semibold text-lg">Cập nhật sản phẩm</h1>
        <span className="text-xs text-gray-500">ID: {productOriginal.id}</span>
      </div>
      <div className="w-[92%] mx-auto flex flex-col gap-8">
        {/* Thông tin cơ bản */}
        <Card className="bg-white">
          <CardTitle className="px-6 pt-5 text-base font-semibold">Thông tin cơ bản</CardTitle>
          <CardContent className="p-6 space-y-6">
            {/* Image upload section */}
            <div className="w-full">
              <Label className="text-black text-base font-medium mb-2">
                Thêm ảnh bìa mới:
              </Label>
              <div className="w-full flex gap-8">
                <button
                  type="button"
                  onClick={() => primaryInputRef.current?.click()}
                  className="w-fit h-fit cursor-pointer"
                  disabled={uploadingPrimary}
                >
                  <div className="w-32 h-32 border border-dashed rounded-sm border-gray-400 relative bg-white">
                    {uploadingPrimary ? (
                      <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 mb-1 text-blue-500 animate-spin" />
                        <span className="text-xs">Đang tải...</span>
                      </div>
                    ) : primaryPreview ? (
                      <Image
                        src={primaryPreview}
                        alt="Primary"
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
                      disabled={uploadingPrimary}
                    />
                  </div>
                </button>
                <ul className="text-sm text-gray-500 list-disc pl-5">
                  <li>Tải lên ảnh bìa mới để thay thế (tỉ lệ 1:1 tốt nhất).</li>
                  <li>Ảnh cũ được quản lý ở phần bên dưới.</li>
                </ul>
              </div>
            </div>

            <div className="w-full gap-2 flex flex-col">
              <Label className="text-black text-base font-medium">
                Thêm ảnh sản phẩm mới:
              </Label>
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
                      className="absolute bottom-0 w-full p-2 bg-black/60 rounded-none cursor-pointer hidden group-hover:block transition"
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
                    disabled={uploadingProducts}
                  >
                    <div className="w-32 h-32 border border-dashed rounded-sm border-gray-400 relative bg-white">
                      {uploadingProducts ? (
                        <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                          <Loader2 className="w-8 h-8 mb-1 text-blue-500 animate-spin" />
                          <span className="text-xs">Đang tải...</span>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 flex flex-col items-center justify-center h-full">
                          <ImagePlus className="w-8 h-8 mb-1 text-red-400" />
                          <span className="text-xs">({productPreviews.length}/9)</span>
                        </div>
                      )}
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
                  disabled={uploadingProducts}
                />
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitBasic)} className="grid md:grid-cols-2 gap-5">
                <FormField name="productName" control={form.control} render={({field}) => (
                  <FormItem>
                    <FormLabel>Tên sản phẩm</FormLabel>
                    <FormControl><Input {...field} className="rounded-none"/></FormControl>
                    <FormMessage/>
                  </FormItem>
                )}/>
                <FormField name="sku" control={form.control} render={({field}) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl><Input {...field} className="rounded-none"/></FormControl>
                    <FormMessage/>
                  </FormItem>
                )}/>
                <FormField name="categoryId" control={form.control} render={() => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Danh mục</FormLabel>
                    <FormControl>
                      <div
                        onClick={() => setCategoryModalOpen(true)}
                        className="bg-white text-black border border-input rounded-none px-3 py-2 cursor-pointer min-h-10 flex items-center"
                      >
                        {selectedCategory?.categoryName || "Chọn danh mục"}
                      </div>
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}/>
                <FormField name="description" control={form.control} render={({field}) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl><Textarea {...field} className="min-h-32 rounded-none"/></FormControl>
                    <FormMessage/>
                  </FormItem>
                )}/>
                <div className="md:col-span-2 flex justify-end">
                  <Button disabled={savingBasic} type="submit" className="rounded-none px-6">
                    {savingBasic ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1"/>
                        Đang lưu
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1"/>
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Thông tin bán hàng */}
        <Card className="bg-white">
          <CardTitle className="px-6 pt-5 text-base font-semibold">Thông tin bán hàng</CardTitle>
          <CardContent className="p-6">
            <Form {...form}>
              <form className="grid md:grid-cols-2 gap-5">
                {!productOriginal.hasVariant && (
                  <>
                    <FormField name="basePrice" control={form.control} render={({field}) => (
                      <FormItem>
                        <FormLabel>Giá sản phẩm</FormLabel>
                        <FormControl><Input type="number" {...field} onChange={e=>field.onChange(Number(e.target.value))} className="rounded-none" /></FormControl>
                      </FormItem>
                    )}/>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Số lượng trong kho</label>
                      <div className="flex gap-2">
                        <Input value={stockChange} onChange={e=>setStockChange(e.target.value)} className="w-32 rounded-none" placeholder="+/-" />
                        <Button type="button" variant="secondary" onClick={handleUpdateProductStock} className="rounded-none">Áp dụng</Button>
                        <div className="text-xs text-gray-500 mt-2">Hiện tại: {productOriginal.stockQuantity || 0}</div>
                      </div>
                    </div>
                  </>
                )}
                <FormField name="discountPrice" control={form.control} render={({field}) => (
                  <FormItem>
                    <FormLabel>Giá KM</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={e=>field.onChange(Number(e.target.value))} className="rounded-none" /></FormControl>
                  </FormItem>
                )}/>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Vận chuyển */}
        <Card className="bg-white">
          <CardTitle className="px-6 pt-5 text-base font-semibold">Vận chuyển</CardTitle>
          <CardContent className="p-6">
            <Form {...form}>
              <form className="grid md:grid-cols-3 gap-5">
                <FormField name="weight" control={form.control} render={({field}) => (
                  <FormItem>
                    <FormLabel>Cân nặng (Sau khi đóng gói)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" {...field} onChange={e=>field.onChange(Number(e.target.value))} className="rounded-none pr-8" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">gr</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}/>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium mb-2 block">Kích thước đóng gói (Nhỉ vẫn chuyển nhỉ sẽ lấy sau kích thước bán hàng sải kích thước)</Label>
                  <div className="flex gap-3">
                    <FormField name="length" control={form.control} render={({field}) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} onChange={e=>field.onChange(Number(e.target.value))} className="rounded-none pr-8" placeholder="R" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">cm</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}/>
                    <span className="flex items-center">×</span>
                    <FormField name="width" control={form.control} render={({field}) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} onChange={e=>field.onChange(Number(e.target.value))} className="rounded-none pr-8" placeholder="D" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">cm</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}/>
                    <span className="flex items-center">×</span>
                    <FormField name="height" control={form.control} render={({field}) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <Input type="number" {...field} onChange={e=>field.onChange(Number(e.target.value))} className="rounded-none pr-8" placeholder="C" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">cm</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}/>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Phân loại sản phẩm - chỉ hiển thị khi có variant */}
        {productOriginal && productOriginal.hasVariant && (
          <Card className="bg-white">
            <CardTitle className="px-6 pt-5 text-base font-semibold">Phân loại sản phẩm (Tùy chọn các phân loại)</CardTitle>
            <CardContent className="p-6 space-y-6">
              {/* Attributes */}
              {attributes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-4">Thuộc tính sản phẩm</h3>
                  {attributes.map(attr => (
                    <div key={attr.id} className="border rounded-sm p-3 space-y-3 mb-3">
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400">ID: {attr.id}</span>
                        <Input defaultValue={attr.name} onBlur={e=>handleUpdateAttributeName(attr, e.target.value)} className="h-8" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map(v => (
                          <Input key={v.id} defaultValue={v.valueName} onBlur={e=>handleUpdateAttributeValue(v, e.target.value)} className="h-8 w-32 text-xs" />
                        ))}
                        {attr.values.length===0 && <span className="text-xs text-gray-400">(Không có giá trị)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Variants */}
              {variants.length > 0 && (
                <div>
                  <h3 className="font-medium mb-4">Biến thể sản phẩm</h3>
                  {variants.map(variant => (
                    <div key={variant.id} className="border rounded-sm p-3 grid md:grid-cols-6 gap-2 items-end mb-3">
                      <div className="md:col-span-2 flex flex-col gap-1">
                        <label className="text-xs text-gray-500">SKU</label>
                        <Input defaultValue={variant.sku} onBlur={e=>handleUpdateVariant(variant,{ sku:e.target.value })} className="h-8" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Giá</label>
                        <Input type="number" defaultValue={variant.price} onBlur={e=>handleUpdateVariant(variant,{ price:Number(e.target.value) })} className="h-8" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Flash</label>
                        <Input type="number" defaultValue={variant.flashSalePrice} onBlur={e=>handleUpdateVariant(variant,{ flashSalePrice:Number(e.target.value) })} className="h-8" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Tồn kho</label>
                        <Input type="number" defaultValue={variant.stock} onBlur={e=>handleUpdateVariantStock(variant, Number(e.target.value))} className="h-8" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Cân nặng</label>
                        <Input type="number" defaultValue={variant.weight} onBlur={e=>handleUpdateVariant(variant,{ weight:Number(e.target.value) })} className="h-8" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500">Kích thước (DxRxC)</label>
                        <div className="flex gap-1">
                          <Input type="number" placeholder="D" defaultValue={variant.length} onBlur={e=>handleUpdateVariant(variant,{ length:Number(e.target.value) })} className="h-8" />
                          <Input type="number" placeholder="R" defaultValue={variant.width} onBlur={e=>handleUpdateVariant(variant,{ width:Number(e.target.value) })} className="h-8" />
                          <Input type="number" placeholder="C" defaultValue={variant.height} onBlur={e=>handleUpdateVariant(variant,{ height:Number(e.target.value) })} className="h-8" />
                        </div>
                      </div>
                      {variant.attributes && variant.attributes.length>0 && (
                        <div className="md:col-span-6 text-[10px] text-gray-500 flex flex-wrap gap-2 mt-1">
                          {variant.attributes.map(a => <span key={a.attributeName+ a.attributeValue} className="px-2 py-0.5 bg-gray-100 rounded">{a.attributeName}: {a.attributeValue}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quản lý ảnh hiện có */}
        {images.length > 0 && (
          <Card className="bg-white">
            <CardTitle className="px-6 pt-5 text-base font-semibold">Quản lý ảnh hiện có</CardTitle>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map(img => (
                  <div key={img.id} className="relative group border border-gray-200 rounded-sm p-2">
                    <div className="w-32 h-32 border border-gray-300 rounded-sm overflow-hidden relative">
                      <Image
                        src={img.imageUrl}
                        alt={img.altText || "Product image"}
                        fill
                        className="object-cover"
                      />
                      {img.isPrimary && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                          Chính
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                        {!img.isPrimary && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetPrimaryImage(img)}
                              className="text-xs h-6 px-2"
                            >
                              Đặt chính
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(img)}
                              className="text-xs h-6 w-6 p-0"
                            >
                              <Trash className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {img.isPrimary && (
                          <div className="text-white text-xs bg-green-600 px-2 py-1 rounded">
                            Ảnh chính
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 mb-1">
                        {!img.isPrimary && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetPrimaryImage(img)}
                              className="text-xs h-6 px-2 flex-1"
                            >
                              Đặt chính
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(img)}
                              className="text-xs h-6 w-6 p-0"
                            >
                              <Trash className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {img.isPrimary && (
                          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded text-center flex-1">
                            ✓ Ảnh chính
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => document.getElementById(`file-input-${img.id}`)?.click()}
                        className="text-xs h-6 w-full mb-1"
                      >
                        Thay đổi ảnh
                      </Button>
                      <input
                        id={`file-input-${img.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpdateImageWithUpload(img, file);
                        }}
                        className="hidden"
                      />
                      <Input
                        placeholder="Alt text (mô tả ảnh)"
                        defaultValue={img.altText || ""}
                        onBlur={(e) => handleUpdateImage(img, { altText: e.target.value })}
                        className="h-7 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Thứ tự hiển thị"
                        defaultValue={img.displayOrder}
                        onBlur={(e) => handleUpdateImage(img, { displayOrder: Number(e.target.value) })}
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/shop/manager-products"><Button variant="secondary" className="rounded-none">Thoát</Button></Link>
          <Button onClick={()=>load()} type="button" variant="outline" className="rounded-none">Reload</Button>
        </div>
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
