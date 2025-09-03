"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { uploadImage } from "@/services/api/uploadImage";
import { updateMyShop } from "@/services/api/shop/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Edit,
  ImagePlus,
  Loader2,
  Save,
  Store,
  TriangleAlert,
} from "lucide-react";

type ShopLite = {
  id: string;
  shopName: string;
  description: string;
  logoURL: string;
  coverImageURL: string;
};

interface Props {
  shop: ShopLite;
  trigger?: React.ReactNode;
  onSuccess?: (updated: Partial<ShopLite>) => void;
}

function DialogupdateInfor({ shop, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ShopLite>({
    id: shop.id,
    shopName: shop.shopName || "",
    description: shop.description || "",
    logoURL: shop.logoURL || "",
    coverImageURL: shop.coverImageURL || "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    shopName?: string;
    description?: string;
  }>({});

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // reset per open with latest shop
    setForm({
      id: shop.id,
      shopName: shop.shopName || "",
      description: shop.description || "",
      logoURL: shop.logoURL || "",
      coverImageURL: shop.coverImageURL || "",
    });
    setLogoPreview(null);
    setCoverPreview(null);
    setLogoFile(null);
    setCoverFile(null);
    setErrors({});
  }, [open, shop]);

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };
  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const currentErrors: typeof errors = {};
    if (!form.shopName.trim())
      currentErrors.shopName = "Vui lòng nhập tên cửa hàng";
    if (!form.description.trim())
      currentErrors.description = "Vui lòng nhập mô tả";
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length) return;

    setSaving(true);
    try {
      let logoURL = form.logoURL;
      let coverImageURL = form.coverImageURL;

      // Upload images if changed
      if (logoFile) {
        const { imageUrl } = await uploadImage(logoFile);
        logoURL = imageUrl;
      }
      if (coverFile) {
        const { imageUrl } = await uploadImage(coverFile);
        coverImageURL = imageUrl;
      }

      await updateMyShop(form.id, {
        shopName: form.shopName.trim(),
        description: form.description.trim(),
        logoURL,
        coverImageURL,
      });

      toast.success("Cập nhật thông tin cửa hàng thành công");
      onSuccess?.({
        shopName: form.shopName.trim(),
        description: form.description.trim(),
        logoURL,
        coverImageURL,
      });
      setOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật thông tin cửa hàng";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-sm">
        <DialogHeader className="px-5 py-5 border-b flex gap-4 flex-row items-center">
          <div className="bg-gray-200 rounded-full w-12 h-12 flex justify-center items-center">
            <Store className="text-gray-600" />
          </div>
          <div>
            <DialogTitle className="mb-1 font-medium">
              Cập nhật thông tin cửa hàng
            </DialogTitle>
            <DialogDescription>
              Chỉnh sửa tên, mô tả và hình ảnh
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-5 py-5 space-y-6">
          <div>
            <Label
              htmlFor="shopName"
              className="text-black text-sm font-medium mb-1"
            >
              Tên cửa hàng
            </Label>
            <Input
              id="shopName"
              value={form.shopName}
              onChange={(e) =>
                setForm((p) => ({ ...p, shopName: e.target.value }))
              }
              placeholder="Nhập tên cửa hàng"
            />
            {errors.shopName && (
              <p className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                <TriangleAlert size={14} /> {errors.shopName}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="description"
              className="text-black text-sm font-medium mb-1"
            >
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={4}
              placeholder="Nhập mô tả cửa hàng"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 flex gap-2 items-center">
                <TriangleAlert size={14} /> {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-10 gap-6 items-end">
            <div className="col-span-3 flex flex-col gap-2">
              <Label className="text-black text-sm font-medium">
                Ảnh đại diện
              </Label>
              <div
                className="relative w-32 h-32 md:w-44 md:h-44 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-lime-400 transition overflow-hidden"
                onClick={() => logoInputRef.current?.click()}
              >
                {logoPreview || form.logoURL ? (
                  <Image
                    src={logoPreview || form.logoURL}
                    alt="Logo Preview"
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <ImagePlus className="w-10 h-10 text-gray-400" />
                )}
                <input
                  ref={logoInputRef}
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onLogoChange}
                />
              </div>
            </div>

            <div className="col-span-7 flex flex-col gap-2">
              <Label className="text-black text-sm font-medium">Ảnh bìa</Label>
              <div
                className="relative w-full h-32 md:h-44 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-lime-400 transition overflow-hidden"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverPreview || form.coverImageURL ? (
                  <Image
                    src={coverPreview || form.coverImageURL}
                    alt="Cover Preview"
                    fill
                    className="object-cover rounded-md"
                  />
                ) : (
                  <ImagePlus className="w-10 h-10 text-gray-400" />
                )}
                <input
                  ref={coverInputRef}
                  id="cover"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onCoverChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between px-5 pb-6 mt-2">
          <DialogClose className="w-40 bg-gray-200 hover:bg-gray-300 text-black cursor-pointer rounded-md py-2 text-sm text-center">
            <>Thoát</>
          </DialogClose>
          <Button
            onClick={handleSave}
            className="w-40 bg-[#B0F847] hover:bg-[#B0F847]/80 text-black cursor-pointer"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2" /> Lưu
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DialogupdateInfor;
