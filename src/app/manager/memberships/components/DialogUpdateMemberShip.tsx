"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  membershipSchema,
  type MembershipSchema,
} from "@/components/schema/membership_schema";
import { Membership } from "@/types/membership/membership";
import {
  createMembership,
  UpdateMembership,
} from "@/services/api/membership/membership";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Mode = "create" | "update";

interface DialogMemberShipProps {
  mode: Mode;
  trigger?: React.ReactNode;
  initial?: Membership | null;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DialogUpdateMemberShip({
  mode,
  trigger,
  initial,
  onSuccess,
  open,
  onOpenChange,
}: DialogMemberShipProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled =
    typeof open === "boolean" && typeof onOpenChange === "function";
  const dialogOpen = isControlled ? (open as boolean) : internalOpen;
  const setDialogOpen = (v: boolean) =>
    isControlled ? onOpenChange?.(v) : setInternalOpen(v);
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<MembershipSchema>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      name: "",
      type: 0,
      description: "",
    },
  });

  React.useEffect(() => {
    if (!dialogOpen) return;
    if (mode === "update" && initial) {
      form.reset({
        name: initial.name || "",
        type: (() => {
          const raw = (initial as unknown as { type?: string | number })?.type;
          if (typeof raw === "number") return raw === 1 ? 1 : 0;
          if (typeof raw === "string") {
            const t = raw.trim().toLowerCase();
            if (
              t === "1" ||
              t === "new" ||
              t === "gói chính" ||
              t === "goi chinh"
            )
              return 1;
            if (
              t === "0" ||
              t === "renewal" ||
              t === "gói phụ" ||
              t === "goi phu"
            )
              return 0;
          }
          return 0;
        })(),
        description: initial.description || "",
        price: initial.price,
        duration: initial.duration,
        maxModerator: initial.maxModerator,
        maxLivestream: initial.maxLivestream,
        commission: initial.commission,
      });
    } else {
      form.reset({
        name: "",
        type: 0,
        description: "",
        price: undefined,
        duration: undefined,
        maxModerator: undefined,
        maxLivestream: undefined,
        commission: undefined,
      });
    }
  }, [dialogOpen, mode, initial, form]);

  const onSubmit = async (values: MembershipSchema) => {
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createMembership(values);
        toast.success("Tạo gói thành viên thành công");
      } else if (mode === "update" && initial?.membershipId) {
        await UpdateMembership(initial.membershipId, values);
        toast.success("Cập nhật gói thành công");
      }
      setDialogOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(isOpen) => {
        setDialogOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Tạo gói thành viên"
              : "Cập nhật gói thành viên"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Nhập thông tin để tạo gói mới"
              : "Chỉnh sửa thông tin gói thành viên"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên gói *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên gói" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phân loại *</FormLabel>
                    <FormControl>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn phân loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">New</SelectItem>
                          <SelectItem value="0">Renewal</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val === "" ? undefined : parseFloat(val)
                            );
                          }}
                          className="pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                          VND
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời lượng live tối đa (giờ) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val === "" ? undefined : Number(val)
                            );
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                          Giờ
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxModerator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số nhân viên tối đa *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val === "" ? undefined : Number(val)
                            );
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                          Người
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxLivestream"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số livestream tối đa *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hoa hồng (%) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả gói"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <div className="flex w-full justify-end gap-3 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Thoát
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="px-8 bg-[#B0F847] hover:bg-[#B0F847]/80 text-black hover:text-black/50 cursor-pointer"
                >
                  {submitting
                    ? "Đang lưu..."
                    : mode === "create"
                    ? "Tạo gói"
                    : "Cập nhật"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
