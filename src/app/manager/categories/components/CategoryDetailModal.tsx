"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createCategory,
  getAllCategories,
  updateCategory,
} from "@/services/api/categories/categorys";
import { uploadImage } from "@/services/api/uploadImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategorySchema,
  CreateCategorySchema,
} from "@/components/schema/category_schema";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ImagePlus, Loader2, TriangleAlert } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Category, filterCategory } from "@/types/category/category";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { AxiosError } from "axios";

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  parentCategoryID?: string;
  mode?: "create" | "update";
  initialData?: Category | null;
}

/** Kiểu trả về khi upload ảnh */
interface UploadImageResponse {
  imageUrl: string;
  message?: string;
}

/** Kiểu list categories từ API getAllCategories */
interface GetAllCategoriesResponse {
  data: {
    categories: Category[];
  };
}

type CategoryLike = Category & {
  /** Phòng trường hợp backend dùng key khác casing */
  iconUrl?: string | null;
  parentCategoryID?: string | null;
};

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  parentCategoryID,
  mode = "create",
  initialData = null,
}) => {
  const form = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      categoryName: "",
      description: "",
      iconURL: "",
      slug: "",
      parentCategoryID: "",
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = form;

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoadingCategories(true);
      const params: filterCategory = {
        PageIndex: 1,
        PageSize: 100,
        CategoryName: "",
        IsDeleted: false,
      };
      const res: GetAllCategoriesResponse = await getAllCategories(params);
      setCategories(res.data.categories);
    } catch (error) {
      console.error("Fetch Error get All Categories:", error);
      toast.error("Không thể tải danh mục");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (!open) {
      reset();
      setUploadError(null);
      return;
    }

    fetchData();

    if (mode === "update" && initialData) {
      const src =
        (initialData as CategoryLike).iconURL ??
        (initialData as CategoryLike).iconUrl ??
        "";
      setValue("categoryName", initialData.categoryName);
      setValue("description", initialData.description || "");
      setValue("iconURL", src);
      setValue("slug", initialData.slug || "");
      // GIỮ nguyên parent khi update (tránh reset về '')
      setValue(
        "parentCategoryID",
        (initialData as CategoryLike).parentCategoryID ?? ""
      );
    } else if (parentCategoryID) {
      setValue("parentCategoryID", parentCategoryID);
    }
  }, [open, reset, parentCategoryID, setValue, mode, initialData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const res = (await uploadImage(file)) as UploadImageResponse;
      setValue("iconURL", res.imageUrl, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      toast.success(res.message || "Tải ảnh lên thành công");
    } catch (error) {
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Tải ảnh thất bại";
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: CreateCategorySchema) => {
    try {
      const parent =
        values.parentCategoryID === "" || values.parentCategoryID === "none"
          ? null
          : values.parentCategoryID;

      const payload = {
        categoryName: values.categoryName,
        description: values.description || "",
        slug: values.slug || "",
        parentCategoryID: parent,
        iconURL: values.iconURL || "",
        iconUrl: values.iconURL || "",
      };

      if (mode === "update" && initialData) {
        await updateCategory(initialData.categoryId, payload);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await createCategory(payload);
        toast.success("Tạo danh mục thành công");
      }

      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error) {
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        (mode === "update"
          ? "Cập nhật danh mục thất bại. Vui lòng thử lại!"
          : "Tạo danh mục thất bại. Vui lòng thử lại!");
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === "update" ? "Cập nhật danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* categoryName */}
            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên danh mục <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên danh mục"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả (tối đa 250 ký tự)"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* iconURL */}
            <FormField
              control={form.control}
              name="iconURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon danh mục</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      <div
                        className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-lime-400 transition"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Chọn ảnh icon"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            fileInputRef.current?.click();
                          }
                        }}
                      >
                        {field.value ? (
                          <Image
                            src={field.value}
                            alt="Icon Preview"
                            fill
                            className="object-cover rounded-full"
                          />
                        ) : uploading ? (
                          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                        ) : (
                          <ImagePlus className="w-8 h-8 text-gray-400" />
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={uploading || isSubmitting}
                        />
                      </div>
                      {uploadError && (
                        <div className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                          <TriangleAlert size={14} />
                          {uploadError}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* parentCategoryID */}
            <FormField
              control={form.control}
              name="parentCategoryID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục cha</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(v) =>
                        field.onChange(v === "" || v === "none" ? null : v)
                      }
                      disabled={isSubmitting || loadingCategories}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            loadingCategories
                              ? "Đang tải..."
                              : "Chọn danh mục cha (nếu có)"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không có</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem
                            key={cat.categoryId}
                            value={cat.categoryId}
                          >
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-[#B0F847] text-black shadow py-5 text-base hover:bg-[#B0F847]/80 hover:text-black/80"
                disabled={isSubmitting || uploading}
              >
                {isSubmitting
                  ? mode === "update"
                    ? "Đang cập nhật..."
                    : "Đang tạo..."
                  : mode === "update"
                  ? "Cập nhật"
                  : "Tạo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryModal;
