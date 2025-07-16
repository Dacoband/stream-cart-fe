import { Card } from "@/components/ui/card";
import { Cart, PreviewOrder } from "@/types/Cart/Cart";
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Minus, Plus, Store, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PriceTag from "@/components/common/PriceTag";
import { updateCart, deleteCart, previewOrder } from "@/services/api/cart/cart";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/CartContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
interface ShoppingCartProps {
  cart: Cart;
}

function ShoppingCart({ cart }: ShoppingCartProps) {
  const [currentCart, setCurrentCart] = useState(cart);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [preview, setPreview] = useState<PreviewOrder | null>(null);
  const { refreshCart } = useCart();
  const router = useRouter();
  const allIds = currentCart.cartItemByShop.flatMap((shop) =>
    shop.products.map((p) => p.cartItemId)
  );

  const handleBuy = () => {
    if (selectedIds.length === 0) return;

    const params = selectedIds.map((id) => `cartItemIds=${id}`).join("&");
    router.push(`/customer/order?${params}`);
  };

  // SelectProduct
  const handleCheckProduct = async (cartItemId: string) => {
    let newSelected: string[];
    if (selectedIds.includes(cartItemId)) {
      newSelected = selectedIds.filter((id) => id !== cartItemId);
    } else {
      newSelected = [...selectedIds, cartItemId];
    }
    setSelectedIds(newSelected);
    //  API previewOrder
    if (newSelected.length > 0) {
      const res = await previewOrder(newSelected);
      setPreview(res);
    } else {
      setPreview(null);
    }
  };

  // SelectShop
  const handleCheckShop = async (shopId: string) => {
    const shop = currentCart.cartItemByShop.find((s) => s.shopId === shopId);
    if (!shop) return;
    const shopIds = shop.products.map((p) => p.cartItemId);
    const allSelected = shopIds.every((id) => selectedIds.includes(id));
    let newSelected;
    if (allSelected) {
      newSelected = selectedIds.filter((id) => !shopIds.includes(id));
    } else {
      newSelected = Array.from(new Set([...selectedIds, ...shopIds]));
    }
    setSelectedIds(newSelected);
    if (newSelected.length > 0) {
      const res = await previewOrder(newSelected);
      setPreview(res);
    } else {
      setPreview(null);
    }
  };

  // Select All
  const handleCheckAll = async () => {
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    let newSelected: string[];
    if (allSelected) {
      newSelected = [];
    } else {
      newSelected = [...allIds];
    }
    setSelectedIds(newSelected);
    if (newSelected.length > 0) {
      const res = await previewOrder(newSelected);
      setPreview(res);
    } else {
      setPreview(null);
    }
  };

  const handleQuantityChange = async (
    cartItemId: string,
    variantId: string,
    currentQty: number,
    change: number
  ) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    try {
      await updateCart({ cartItem: cartItemId, variantId, quantity: newQty });

      const updated = { ...currentCart };
      for (const shop of updated.cartItemByShop) {
        const product = shop.products.find((p) => p.cartItemId === cartItemId);
        if (product) {
          product.quantity = newQty;
          break;
        }
      }
      await refreshCart();
      setCurrentCart(updated);
    } catch (error) {
      console.error("Lỗi cập nhật giỏ hàng:", error);
    }
  };
  const handleDeleteSelectedProducts = async () => {
    if (selectedIds.length === 0) return;
    setLoadingDelete(true);
    try {
      await deleteCart(selectedIds);

      const updated = { ...currentCart };
      updated.cartItemByShop = updated.cartItemByShop
        .map((shop) => ({
          ...shop,
          products: shop.products.filter(
            (p) => !selectedIds.includes(p.cartItemId)
          ),
        }))
        .filter((shop) => shop.products.length > 0);

      updated.totalProduct = updated.cartItemByShop.reduce(
        (sum, shop) => sum + shop.products.length,
        0
      );

      setCurrentCart(updated);
      await refreshCart();
      setSelectedIds([]);
      setPreview(null);
    } catch (error) {
      console.error("Lỗi xóa nhiều sản phẩm:", error);
    } finally {
      setLoadingDelete(false);
    }
  };
  const handleDeleteProduct = async (cartItemId: string) => {
    setLoadingDelete(true);
    try {
      await deleteCart([cartItemId]);

      const updated = { ...currentCart };
      updated.cartItemByShop = updated.cartItemByShop
        .map((shop) => ({
          ...shop,
          products: shop.products.filter((p) => p.cartItemId !== cartItemId),
        }))
        .filter((shop) => shop.products.length > 0);

      updated.totalProduct = updated.cartItemByShop.reduce(
        (sum, shop) => sum + shop.products.length,
        0
      );

      setCurrentCart(updated);
      await refreshCart();
      setSelectedIds((prev) => prev.filter((id) => id !== cartItemId));
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
    } finally {
      setLoadingDelete(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="w-full mb-28 space-y-3">
      {/* Header */}
      <Card
        className="rounded-none shadow-none grid items-center px-5"
        style={{ gridTemplateColumns: "35px 6fr 2fr 2fr 2fr 1fr" }}
      >
        <div className="flex items-center ">
          <Checkbox
            className="w-5 h-5"
            checked={
              allIds.length > 0 &&
              allIds.every((id) => selectedIds.includes(id))
            }
            onCheckedChange={handleCheckAll}
          />
        </div>
        <div className="text-left font-medium">Tên sản phẩm</div>
        <div className="text-center ">Đơn Giá</div>
        <div className="text-center">Số Lượng</div>
        <div className="text-center">Số Tiền</div>
        <div className="text-center">Thao Tác</div>
      </Card>

      {currentCart.cartItemByShop.map((shop) => (
        <Card
          className="rounded-none shadow-none pb-5 pt-0 items-center  my-3 px-0"
          key={shop.shopId}
        >
          <div
            className=" grid  px-5 w-full items-center mt-6 "
            style={{ gridTemplateColumns: "35px 6fr" }}
          >
            <div className="flex items-center">
              <Checkbox
                className="w-5 h-5"
                checked={
                  shop.products.length > 0 &&
                  shop.products.every((p) => selectedIds.includes(p.cartItemId))
                }
                onCheckedChange={() => handleCheckShop(shop.shopId)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <div className="text-orange-600">
                <Store size={18} />
              </div>
              <span className=" font-medium  text-black/80">
                {shop.shopName}
              </span>
            </div>
          </div>
          <Separator />
          {shop.products.map((product) => (
            <div
              key={product.cartItemId}
              className="rounded-none shadow-none grid items-center w-full px-5  py-0"
              style={{ gridTemplateColumns: "35px 6fr 2fr 2fr 2fr 1fr" }}
            >
              <div className="flex items-center ">
                <Checkbox
                  className="w-5 h-5"
                  checked={selectedIds.includes(product.cartItemId)}
                  onCheckedChange={() => handleCheckProduct(product.cartItemId)}
                />
              </div>
              <div className="text-left gap-2 flex">
                <Image
                  src={product.primaryImage || "/placeholder.svg"}
                  alt={product.productName}
                  width={80}
                  height={85}
                  className="rounded-none h-[85px] w-20 object-cover border"
                />
                <div className="flex-1 mr-5 mb-2  line-clamp-2 min-h-[48px]">
                  {product.productName}
                </div>
                <div className="w-40 text-black/60">
                  {product.attributes &&
                    Object.keys(product.attributes).length > 0 && (
                      <div className="text-sm text-gray-600">
                        <div className="text-gray-800 mb-2 font-medium">
                          Phân loại:
                        </div>
                        <span>
                          {Object.entries(product.attributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                </div>
              </div>
              <div className="text-center ">
                <div className="flex gap-4 justify-center items-center">
                  <span className=" line-through text-black/60">
                    <PriceTag value={product.priceData.originalPrice} />
                  </span>
                  <span className="font-medium ">
                    <PriceTag value={product.priceData.currentPrice} />
                  </span>
                </div>
                {product.priceData.discount > 0 && (
                  <div className="text-xs font-medium mt-2 px-2  bg-rose-600  w-fit mx-auto text-white">
                    Giảm đến {product.priceData.discount}%
                  </div>
                )}
              </div>
              <div>
                <div className="text-center flex gap-2 items-center justify-center">
                  <Button
                    className="bg-white hover:bg-white border rounded-none text-black cursor-pointer"
                    onClick={() =>
                      handleQuantityChange(
                        product.cartItemId,
                        product.variantID,
                        product.quantity,
                        1
                      )
                    }
                  >
                    <Plus />
                  </Button>
                  <div className="w-8">{product.quantity}</div>
                  <Button
                    className="bg-white hover:bg-white border rounded-none text-black cursor-pointer"
                    onClick={() =>
                      handleQuantityChange(
                        product.cartItemId,
                        product.variantID,
                        product.quantity,
                        -1
                      )
                    }
                  >
                    <Minus />
                  </Button>
                </div>
                <div className="text-center text-sm mt-4">
                  Còn lại: {product.stockQuantity} sản phẩm
                </div>
              </div>
              <div className="text-center text-rose-500 font-medium text-lg">
                <PriceTag
                  value={product.quantity * product.priceData.originalPrice}
                />
              </div>
              <div className="text-center flex">
                <AlertDialog
                  open={deleteId === product.cartItemId}
                  onOpenChange={(open) => !open && setDeleteId(null)}
                >
                  <AlertDialogTrigger asChild>
                    <button
                      className="flex items-center gap-1  cursor-pointer justify-center w-full "
                      onClick={() => setDeleteId(product.cartItemId)}
                    >
                      <Trash2 size={16} /> Xóa
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={loadingDelete}
                        onClick={() => handleDeleteProduct(product.cartItemId)}
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </Card>
      ))}

      {/* Footer */}
      <Card
        className="fixed bottom-0  z-50 bg-white shadow-none rounded-none grid items-center px-5 py-3 w-[70%] h-20"
        style={{ gridTemplateColumns: "35px 2fr 1fr 9fr 3fr" }}
      >
        <div className="flex items-center ">
          <Checkbox
            className="w-5 h-5"
            checked={
              allIds.length > 0 &&
              allIds.every((id) => selectedIds.includes(id))
            }
            onCheckedChange={handleCheckAll}
          />
        </div>
        <div className="text-left font-medium">
          Tất cả sản phẩm({currentCart.totalProduct})
        </div>
        <div className="text-center">
          <AlertDialog onOpenChange={(open) => !open && setDeleteId(null)}>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-1  cursor-pointer justify-center w-full ">
                <Trash2 size={16} /> Xóa
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa các sản phẩm này khỏi giỏ hàng?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  disabled={loadingDelete}
                  onClick={handleDeleteSelectedProducts}
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex justify-end w-full">
          <div className="text-right h-full flex gap-5 ">
            <div>
              <div className="text-lg">
                Tổng thanh toán ({preview?.totalItem || 0} sản phẩm):
              </div>
              <div className="text-base">Tiết kiệm:</div>
            </div>
            <div>
              <div className="font-medium text-rose-500 text-2xl">
                <PriceTag value={preview?.totalAmount || 0} />
              </div>
              <div className="text-base">
                <PriceTag value={preview?.discount || 0} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center">
          <Button
            onClick={handleBuy}
            disabled={selectedIds.length === 0}
            className="text-center bg-black text-white py-4 h-[80%] font-normal text-lg w-full cursor-pointer rounded-none"
          >
            Mua hàng
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ShoppingCart;
