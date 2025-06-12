import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface RegisterShopFormData {
  avatarUrl: string;
  shopName: string;
  description: string;
  cover2image: string;
}

interface RegisterShopFormProps {
  register: UseFormRegister<RegisterShopFormData>;
  errors: FieldErrors<RegisterShopFormData>;
  onBack: () => void;
  onSubmit: (data: RegisterShopFormData) => void;
  handleSubmit: (
    onValid: (data: RegisterShopFormData) => void
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export default function RegisterShopForm({
  register,
  errors,
  onBack,
  onSubmit,
  handleSubmit,
}: RegisterShopFormProps) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-3">
        <Label htmlFor="avatarUrl" className="text-white">
          Ảnh đại diện cửa hàng (URL):
        </Label>
        <Input id="avatarUrl" {...register("avatarUrl")} />
        {errors.avatarUrl && (
          <p className="text-red-500 text-sm">
            {errors.avatarUrl.message as string}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="shopName" className="text-white">
          Tên cửa hàng:
        </Label>
        <Input id="shopName" {...register("shopName")} />
        {errors.shopName && (
          <p className="text-red-500 text-sm">
            {errors.shopName.message as string}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="description" className="text-white">
          Mô tả cửa hàng:
        </Label>
        <Input id="description" {...register("description")} />
        {errors.description && (
          <p className="text-red-500 text-sm">
            {errors.description.message as string}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="cover2image" className="text-white">
          Ảnh bìa cửa hàng (URL):
        </Label>
        <Input id="cover2image" {...register("cover2image")} />
        {errors.cover2image && (
          <p className="text-red-500 text-sm">
            {errors.cover2image.message as string}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={onBack}>
          Quay lại
        </Button>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r bg-[#B0F847] text-black hover:text-white cursor-pointer"
        >
          Đăng ký
        </Button>
      </div>
    </form>
  );
}
