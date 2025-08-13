"use client";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle, ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AxiosError } from "axios";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

import BreadcrumbNewLive from "../components/BreadcrumbNewLive";

import {
  createLivestreamSchema,
  CreateLivestreamSchema,
} from "@/components/schema/livestream_schema";
import { createLivestream } from "@/services/api/livestream/livestream";
import { uploadImage } from "@/services/api/uploadImage";
import ProductsLivestream from "../components/ProductsLivestream";
import { CreateLivestreamProduct } from "@/types/livestream/livestream";

function Page() {
  const [loadingbt, setLoadingbt] = useState(false);
  const [products, setProducts] = useState<CreateLivestreamProduct[]>([]);
  const router = useRouter();
  const [thumbnailUrlPreview, setthumbnailUrlPreview] = useState<string | null>(
    null
  );
  const thumbnailUrlInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateLivestreamSchema>({
    resolver: zodResolver(createLivestreamSchema),
    defaultValues: {
      title: "",
      description: "",

      thumbnailUrl: undefined,
    },
  });
  const defaultStartTime = form.watch("scheduledStartTime");
  const initialDate = defaultStartTime ? new Date(defaultStartTime) : undefined;
  const initialTime = defaultStartTime
    ? format(new Date(defaultStartTime), "HH:mm")
    : "12:00";

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate
  );
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);

  const onSubmit = async (data: CreateLivestreamSchema) => {
    setLoadingbt(true);
    try {
      if (products.length === 0) {
        toast.error("Vui lòng chọn ít nhất 1 sản phẩm cho livestream!");
        setLoadingbt(false);
        return;
      }

      const thumbnailFile = data.thumbnailUrl as File;
      const thumbnailUpload = await uploadImage(thumbnailFile);
      const thumbnailUrl = thumbnailUpload.imageUrl;

      await createLivestream({
        title: data.title,
        description: data.description,
        scheduledStartTime: data.scheduledStartTime,
        thumbnailUrl,
        tags: data.tags || "",
        products,
      });

      toast.success("Tạo livestream thành công!");
      router.push(`/shop/livestreams`);
      form.reset();
      setthumbnailUrlPreview(null);
    } catch (error: unknown) {
      console.error("Create user failed:", error);
      const err = error as AxiosError<{ message?: string; errors?: string[] }>;
      const message =
        err?.response?.data?.errors?.[0] ||
        err?.response?.data?.message ||
        "Cập nhật thất bại!";
      toast.error(message);
    } finally {
      setLoadingbt(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <BreadcrumbNewLive />
      </div>

      <div className="w-[90%] mx-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("Form errors:", errors);
              toast.error("Vui lòng kiểm tra lại thông tin sản phẩm!");
            })}
            className="flex flex-col gap-5 mx-5 mb-10"
          >
            <Card className="bg-white py-5 px-8 rounded-sm">
              <CardTitle className="text-xl font-medium">
                Thông tin cơ bản
              </CardTitle>
              <CardContent className="p-0 space-y-6">
                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        <div className="text-red-500 text-lg">*</div>Ảnh bìa
                        livestreams
                      </FormLabel>
                      <div className="flex gap-5">
                        <div
                          className="relative w-44 h-44 flex items-center justify-center cursor-pointer border-2 border-dashed border-red-400 hover:border-red-400 transition"
                          onClick={() => thumbnailUrlInputRef.current?.click()}
                        >
                          {thumbnailUrlPreview ? (
                            <Image
                              src={thumbnailUrlPreview}
                              alt="Logo Preview"
                              fill
                              className="object-cover "
                            />
                          ) : (
                            <ImagePlus className="w-10 h-10 text-red-400" />
                          )}
                          <input
                            ref={thumbnailUrlInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                                setthumbnailUrlPreview(
                                  URL.createObjectURL(file)
                                );
                              }
                            }}
                          />
                        </div>
                        <ul className="text-sm text-gray-500 list-disc pl-5">
                          <li>
                            Tải lên hình ảnh có tỉ lệ 1:1 để có ảnh đẹp nhất.
                          </li>
                        </ul>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        <div className="text-red-500 text-lg">*</div>Tiêu đề
                        livestream
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề" {...field} />
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
                        <div className="text-red-500 text-lg">*</div>Mô tả
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nhập mô tả" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        <div className="text-red-500 text-lg">*</div>Tags
                        Livestream
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tag" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduledStartTime"
                  render={({ field }) => {
                    const updateFormValue = (
                      date: Date | undefined,
                      time: string
                    ) => {
                      if (!date) return;
                      const [hours, minutes] = time.split(":");
                      const updated = new Date(date);
                      updated.setHours(Number(hours));
                      updated.setMinutes(Number(minutes));
                      field.onChange(updated);
                    };

                    const handleDateChange = (date: Date | undefined) => {
                      setSelectedDate(date);
                      updateFormValue(date, selectedTime);
                    };

                    const handleTimeChange = (
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => {
                      const newTime = e.target.value;
                      setSelectedTime(newTime);
                      updateFormValue(selectedDate, newTime);
                    };

                    return (
                      <FormItem>
                        <FormLabel className="text-base font-medium flex items-center gap-1">
                          <span className="text-red-500 text-lg">*</span>
                          Thời gian bắt đầu
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-3">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-[150px] justify-start text-left font-normal"
                                >
                                  📅{" "}
                                  {selectedDate
                                    ? format(selectedDate, "dd/MM/yyyy")
                                    : "Chọn ngày"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={handleDateChange}
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              type="time"
                              value={selectedTime}
                              onChange={handleTimeChange}
                              className="w-[120px]"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <ProductsLivestream value={products} onChange={setProducts} />
              </CardContent>
            </Card>

            {/* Nút hành động */}
            <div className="bg-white sticky bottom-0 z-10 h-fit w-full py-3 px-5 shadow border flex justify-between items-center">
              <div className="w-[90%] flex justify-end mx-auto gap-5">
                <Link href={"/shop/livestreams"}>
                  <Button
                    type="button"
                    className="px-8 font-normal py-2 h-full bg-white hover:bg-white border-2 text-black hover:text-black/50 text-base cursor-pointer"
                  >
                    Thoát
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="px-8 h-full py-2 font-normal bg-[#B0F847] hover:bg-[#B0F847]/80 text-black hover:text-black/50 text-base cursor-pointer"
                  disabled={loadingbt}
                >
                  {loadingbt ? (
                    <>
                      <Loader2 className="animate-spin mr-1" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-1" />
                      Tạo livestream
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Page;
