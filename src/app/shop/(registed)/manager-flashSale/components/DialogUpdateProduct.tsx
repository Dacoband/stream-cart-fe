import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Box } from "lucide-react";
import { FlashSaleProductHome } from "@/types/product/flashSale";
import { updateProductFlashSale } from "@/services/api/product/flashSale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PriceTag from "@/components/common/PriceTag";

type Props = {
  open: boolean;
  onClose: (open: boolean) => void;
  product: FlashSaleProductHome | null;
  onUpdated?: () => void;
};

export default function DialogUpdateProduct({
  open,
  onClose,
  product,
  onUpdated,
}: Props) {
  const [flashSalePrice, setFlashSalePrice] = React.useState<number | "">("");
  const [quantityAvailable, setQuantityAvailable] = React.useState<number | "">(
    ""
  );
  const [saving, setSaving] = React.useState(false);
  const [priceError, setPriceError] = React.useState<string | null>(null);
  const [qtyError, setQtyError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && product) {
      setFlashSalePrice(product.flashSalePrice ?? 0);
      setQuantityAvailable(product.quantityAvailable ?? 0);
      setPriceError(null);
      setQtyError(null);
    } else {
      setFlashSalePrice("");
      setQuantityAvailable("");
      setPriceError(null);
      setQtyError(null);
    }
  }, [open, product]);

  const handleSave = async () => {
    if (!product) return;
    const priceNum =
      typeof flashSalePrice === "string"
        ? Number(flashSalePrice)
        : flashSalePrice;
    const qtyNum =
      typeof quantityAvailable === "string"
        ? Number(quantityAvailable)
        : quantityAvailable;

    let hasError = false;
    // Validate price
    if (isNaN(priceNum)) {
      setPriceError("Vui lòng nhập giá hợp lệ");
      hasError = true;
    } else if (priceNum <= 0) {
      setPriceError("Giá phải lớn hơn 0");
      hasError = true;
    } else if (priceNum >= (product.price ?? 0)) {
      setPriceError("Giá Flash Sale phải nhỏ hơn giá gốc");
      hasError = true;
    } else {
      setPriceError(null);
    }
    // Validate quantity
    if (isNaN(qtyNum)) {
      setQtyError("Vui lòng nhập số lượng hợp lệ");
      hasError = true;
    } else if (qtyNum <= 0) {
      setQtyError("Số lượng phải lớn hơn 0");
      hasError = true;
    } else if (qtyNum < (product.quantitySold ?? 0)) {
      setQtyError("Số lượng phải lớn hơn hoặc bằng số lượng đã bán");
      hasError = true;
    } else if (qtyNum > (product.stock ?? Infinity)) {
      setQtyError("Số lượng không được lớn hơn kho");
      hasError = true;
    } else {
      setQtyError(null);
    }

    if (hasError) return;
    try {
      setSaving(true);
      await updateProductFlashSale(product.id, {
        flashSalePrice: priceNum,
        quantityAvailable: qtyNum,
        startTime: new Date(product.startTime).toISOString(),
        endTime: new Date(product.endTime).toISOString(),
      });
      toast.success("Cập nhật sản phẩm thành công");
      onUpdated?.();
      onClose(false);
    } catch (e) {
      console.error(e);
      toast.error("Cập nhật sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className=" m-0 py-5 max-h-[78vh] overflow-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#B0F847] rounded-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-black" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Cập nhật sản phẩm
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Chỉnh sửa giá và số lượng. Thời gian không thay đổi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 px-1 border-t">
          <div className="flex justify-between mt-5">
            <div className="flex gap-2">
              <div className="w-[65px] h-[65px] relative flex-shrink-0">
                <Image
                  src={product?.productImageUrl || "/assets/emptydata.png"}
                  alt={product?.productName || "Product image"}
                  fill
                  className="rounded object-cover"
                />
              </div>

              <div>
                <p className="font-semibold text-base text-gray-900 line-clamp-2 break-words whitespace-normal max-w-[305px]">
                  {product?.productName || ""}
                </p>
                <p className="text-gray-700">{product?.variantName || ""}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Giá gốc:</p>
              <p className="text-rose-500 text-sm font-medium">
                {" "}
                <PriceTag value={product?.price ?? 0} />
              </p>
            </div>
            <div className="">
              <p className="text-sm font-medium text-gray-600 mb-2">Đã bán:</p>
              <p className="text-gray-700 text-sm">{product?.quantitySold}</p>
            </div>
            <div className="">
              <p className="text-sm font-medium text-gray-600 mb-2">Kho:</p>
              <p className="text-gray-700 text-sm">{product?.stock}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Giá Flash Sale</label>
            <Input
              type="number"
              min={0}
              value={flashSalePrice}
              onChange={(e) => {
                setFlashSalePrice(
                  e.target.value === "" ? "" : Number(e.target.value)
                );
                setPriceError(null);
              }}
              placeholder="Nhập giá flash sale"
            />
            {priceError && (
              <div className="text-xs text-red-500 mt-1">{priceError}</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Số lượng FlashSale</label>
            <Input
              type="number"
              min={product?.quantitySold ?? 0}
              max={product?.stock ?? undefined}
              value={quantityAvailable}
              onChange={(e) => {
                setQuantityAvailable(
                  e.target.value === "" ? "" : Number(e.target.value)
                );
                setQtyError(null);
              }}
              placeholder="Nhập số lượng"
            />
            {qtyError && (
              <div className="text-xs text-red-500 mt-1">{qtyError}</div>
            )}
          </div>
        </div>
        <DialogFooter className="px-1">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={saving}>
              Hủy
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={saving}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
