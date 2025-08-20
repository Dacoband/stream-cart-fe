"use client";
import { CirclePlay } from "lucide-react";
import React from "react";
import {
  deleteProductLivestream,
  updateStockProductLiveStream,
} from "@/services/api/livestream/productLivestream";
import { ProductLiveStream } from "@/types/livestream/productLivestream";
import { Card } from "@/components/ui/card";
import {
  getProductByLiveStreamId,
  updatePinProductLiveStream,
} from "@/services/api/livestream/productLivestream";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Edit, ImageIcon, Pin, PinOff, Search, Trash2 } from "lucide-react";
import PriceTag from "@/components/common/PriceTag";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLivestreamRealtime } from "@/services/signalr/useLivestreamRealtime";

type ProductsProps = {
  livestreamId: string;
  onPinnedChange?: (pinned: ProductLiveStream | null) => void;
  refreshFlag?: boolean; // toggle to force refetch from parent
  isLive: boolean;
};
function ManageProductLive({
  livestreamId,
  onPinnedChange,
  refreshFlag,
  isLive,
}: ProductsProps) {
  const [products, setProducts] = React.useState<ProductLiveStream[]>([]);
  const [search, setSearch] = React.useState("");
  const [pinLoadingId, setPinLoadingId] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<ProductLiveStream | null>(null);
  const [newStock, setNewStock] = React.useState<number>(0);
  const [saving, setSaving] = React.useState(false);

  // realtime hub api
  const realtime = useLivestreamRealtime(livestreamId);

  const fetchProducts = React.useCallback(async () => {
    const data = await getProductByLiveStreamId(livestreamId);
    setProducts(data);
    // inform parent about current pinned item
    const currentPinned = Array.isArray(data)
      ? (data as ProductLiveStream[]).find((p) => p.isPin)
      : undefined;
    onPinnedChange?.(currentPinned || null);
  }, [livestreamId, onPinnedChange]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Refetch when parent indicates external pin/unpin happened
  React.useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshFlag]);

  const handleTogglePin = async (product: ProductLiveStream) => {
    if (!isLive) {
      toast.error("Live: Không thể ghim sản phẩm vì live chưa bắt đầu");
      return;
    }
    const newIsPin = !product.isPin;
    try {
      setPinLoadingId(product.id);
      // broadcast via realtime; fallback to REST
      await Promise.race([
        realtime.pinById(product.id, newIsPin),
        updatePinProductLiveStream(product.id, newIsPin),
      ]);
      // Update local list: only one item should be pinned at a time
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, isPin: newIsPin }
            : newIsPin
            ? { ...p, isPin: false }
            : p
        )
      );
      onPinnedChange?.(newIsPin ? { ...product, isPin: true } : null);
    } finally {
      setPinLoadingId(null);
    }
  };

  const openEdit = (product: ProductLiveStream) => {
    setEditing(product);
    setNewStock(Number(product.stock || 0));
  };

  const handleSaveStock = async () => {
    if (!editing) return;
    const max = Number(editing.productStock ?? 0);
    const value = Math.max(0, Math.floor(Number(newStock) || 0));
    if (value > max) {
      toast.error("Số lượng trong live không được lớn hơn tồn kho sản phẩm");
      return;
    }
    try {
      setSaving(true);
      // prefer realtime hub; fallback to REST
      await Promise.race([
        realtime.updateStockById(editing.id, value),
        updateStockProductLiveStream(editing.id, value),
      ]);
      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, stock: value } : p))
      );
      toast.success("Cập nhật số lượng thành công");
      setEditing(null);
    } catch {
      toast.error("Không thể cập nhật số lượng. Vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: ProductLiveStream) => {
    const ok = window.confirm(
      `Xóa sản phẩm khỏi livestream?\n${product.productName}`
    );
    if (!ok) return;
    try {
      // prefer realtime hub; fallback to REST
      await Promise.race([
        realtime.deleteById(product.id),
        deleteProductLivestream(product.id),
      ]);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Đã xóa sản phẩm khỏi livestream");
      // If the deleted product was pinned, inform parent to clear
      if (product.isPin) {
        onPinnedChange?.(null);
      }
    } catch {
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại");
    }
  };

  // Lọc sản phẩm theo tên
  const filteredProducts = products.filter((p) =>
    p.productName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full min-h-[50vh] max-h-[90vh] rounded-none overflow-hidden bg-white">
      <div className="flex gap-2 text-2xl mb-4 items-center font-medium">
        <CirclePlay className="text-red-600 " /> Sản phẩm trong LiveStream
      </div>

      {/* Thanh tìm kiếm */}
      <div className="px-4 py-2 border-b flex items-center gap-2 sticky top-0 bg-white z-10">
        <Search className="text-gray-500 w-4 h-4" />
        <Input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8"
        />
      </div>

      {/* Danh sách sản phẩm */}
      <div className="overflow-y-auto custom-scroll flex-1 mt-5 px-2 space-y-3">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className=" py-2 px-2 grid grid-cols-5 rounded-none gap-2 "
            >
              <div className="col-span-2 flex gap-3">
                {product.productImageUrl ? (
                  <Image
                    height={90}
                    width={90}
                    src={product.productImageUrl}
                    alt={product.productName}
                    className="rounded object-cover h-[90px] w-[90px]"
                  />
                ) : (
                  <div className="h-[85px] w-[85px] bg-gray-200 flex items-center justify-center rounded">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1  items-start">
                  <h3 className="font-medium text-sm mb-2 line-clamp-1">
                    {product.productName}
                  </h3>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  {product.variantName && (
                    <p className="text-xs text-gray-500">
                      Phân loại: {product.variantName}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-span-1 justify-center flex flex-col">
                <p className="text-gray-500 text-sm font-medium ">Giá bán:</p>
                <div className="flex gap-4 text-base items-end">
                  <p className="text-red-500 font-semibold mt-2">
                    <PriceTag value={product.price} />
                  </p>
                  <p className="text-gray-500 font-medium text-sm line-through  mt-2">
                    <PriceTag value={product.originalPrice} />
                  </p>
                </div>
              </div>
              <div className="col-span-1 justify-center flex flex-col">
                <p className="text-gray-500 text-sm font-medium ">
                  Số lượng trong live:
                </p>
                <div className="flex gap-4 items-end">
                  <p className="text-green-500 text-base font-semibold mt-2">
                    {product.stock}
                  </p>
                </div>
              </div>
              <div className=" flex col-span-1 justify-end items-center">
                <Button
                  onClick={() => handleTogglePin(product)}
                  disabled={pinLoadingId === product.id}
                  className=" text-lime-600 bg-white rounded-none cursor-pointer shadow-none hover:bg-white hover:text-lime-400"
                >
                  {product.isPin ? (
                    <div className="flex gap-1 items-center">
                      <PinOff size={16} /> Bỏ ghim
                    </div>
                  ) : (
                    <div className="flex gap-1 items-center">
                      <Pin size={16} /> Ghim
                    </div>
                  )}
                </Button>

                <div>
                  <Button
                    onClick={() => openEdit(product)}
                    className=" text-blue-500 bg-white rounded-none cursor-pointer shadow-none hover:bg-white hover:text-blue-400"
                  >
                    <Edit /> Số lượng
                  </Button>
                  <Button
                    onClick={() => handleDelete(product)}
                    className=" text-red-500 bg-white rounded-none cursor-pointer shadow-none hover:bg-white hover:text-red-400"
                  >
                    <Trash2 /> Xóa
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 text-sm mt-4">
            Không tìm thấy sản phẩm
          </p>
        )}
      </div>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật số lượng</DialogTitle>
            <DialogDescription>
              Tồn kho sản phẩm (stockProduct):
              <span className="font-semibold ml-1">
                {editing?.productStock ?? 0}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="stock">Số lượng trong livestream</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                max={editing?.productStock ?? undefined}
                value={Number.isFinite(newStock) ? newStock : 0}
                onChange={(e) => {
                  const v = Math.floor(Number(e.target.value || 0));
                  if (editing?.productStock !== undefined) {
                    setNewStock(Math.max(0, Math.min(v, editing.productStock)));
                  } else {
                    setNewStock(Math.max(0, v));
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                Không được vượt quá {editing?.productStock ?? 0}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveStock} disabled={saving}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManageProductLive;
