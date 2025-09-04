"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Plus, Minus, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { updateStockProductLiveStream } from "@/services/api/livestream/productLivestream";
import { getProductDetail } from "@/services/api/product/productDetail";
import type { LivestreamProduct } from "@/types/livestream/livestream";
import { Badge } from "@/components/ui/badge";

interface UpdateStockModalProps {
  open: boolean;
  product: LivestreamProduct | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateStockModal({
  open,
  product,
  onClose,
  onSuccess,
}: UpdateStockModalProps) {
  const [loading, setLoading] = useState(false);
  const [newStock, setNewStock] = useState<number>(product?.stock || 0);
  const [loadingProductDetail, setLoadingProductDetail] = useState(false);
  const [maxStock, setMaxStock] = useState<number>(0);
  const [stockValidation, setStockValidation] = useState<{
    isValid: boolean;
    message?: string;
  }>({ isValid: true });

  // Fetch product detail when modal opens and product changes
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!product?.productId) return;

      try {
        setLoadingProductDetail(true);
        const detail = await getProductDetail(product.productId);
        
        // Calculate max stock based on variant or total stock
        const variantId = product.variantId;
        const maxAvailable = variantId 
          ? (detail.variants.find(v => v.variantId === variantId)?.stock || 0)
          : detail.stockQuantity;
        
        setMaxStock(maxAvailable);
        
        // Validate current stock
        validateStock(newStock, maxAvailable, variantId);
        
      } catch (error) {
        console.error("Error fetching product detail:", error);
        toast.error("Không thể lấy thông tin kho hàng");
        setMaxStock(0);
      } finally {
        setLoadingProductDetail(false);
      }
    };

    if (open && product?.productId) {
      fetchProductDetail();
    }
  }, [open, product?.productId, product?.variantId, newStock]);

  const validateStock = (stock: number, maxAvailable: number, variantId?: string) => {
    if (stock > maxAvailable) {
      setStockValidation({
        isValid: false,
        message: variantId 
          ? `Số lượng tối đa cho phân loại này là ${maxAvailable}`
          : `Số lượng tối đa trong kho là ${maxAvailable}`
      });
    } else {
      setStockValidation({ isValid: true });
    }
  };

  // Update local state when product changes
  useEffect(() => {
    if (product) {
      setNewStock(product.stock || 0);
    }
  }, [product]);

  const handleStockChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setNewStock(numValue);
      // Validate against max stock
      if (maxStock > 0) {
        validateStock(numValue, maxStock, product?.variantId);
      }
    }
  };

  const handleIncrement = () => {
    const newValue = newStock + 1;
    setNewStock(newValue);
    if (maxStock > 0) {
      validateStock(newValue, maxStock, product?.variantId);
    }
  };

  const handleDecrement = () => {
    const newValue = Math.max(0, newStock - 1);
    setNewStock(newValue);
    if (maxStock > 0) {
      validateStock(newValue, maxStock, product?.variantId);
    }
  };

  const handleSubmit = async () => {
    if (!product) return;

    // Validation
    if (newStock < 0) {
      toast.error("Số lượng không thể âm");
      return;
    }

    if (!stockValidation.isValid) {
      toast.error(stockValidation.message || "Số lượng không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      
      await updateStockProductLiveStream(product.id, newStock);
      
      toast.success("Cập nhật số lượng thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating stock:", error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      toast.error(`Cập nhật số lượng thất bại: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewStock(product?.stock || 0); // Reset to original value
      setStockValidation({ isValid: true }); // Reset validation
      setMaxStock(0); // Reset max stock
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-blue-600" />
            Cập nhật số lượng
          </DialogTitle>
          <DialogDescription>
            Thay đổi số lượng tồn kho của sản phẩm trong livestream
          </DialogDescription>
        </DialogHeader>

        {product && (
          <div className="space-y-6 py-4">
            {/* Product Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                {product.productName}
              </h4>
              {product.variantName && (
                <p className="text-sm text-gray-600">
                  Phân loại: {product.variantName}
                </p>
              )}
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Số lượng livestream:</span>
                  <span className="font-semibold text-blue-600">{product.stock || 0}</span>
                </div>
                
                {/* Stock Info */}
                {loadingProductDetail ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Số lượng trong kho:</span>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Đang tải...</span>
                  </div>
                ) : maxStock > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Số lượng trong kho:</span>
                    <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                      <Package className="w-3 h-3 mr-1" />
                      {maxStock}
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Số lượng trong kho:</span>
                    <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Không có dữ liệu
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Input */}
            <div className="space-y-3">
              <Label htmlFor="stock" className="text-sm font-medium">
                Số lượng mới cho livestream
              </Label>
              
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDecrement}
                  disabled={loading || newStock <= 0}
                  className="w-10 h-10 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <Input
                  id="stock"
                  type="number"
                  value={newStock}
                  onChange={(e) => handleStockChange(e.target.value)}
                  min="0"
                  max={maxStock || undefined}
                  className={`text-center font-semibold text-lg flex-1 ${
                    !stockValidation.isValid ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  disabled={loading}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleIncrement}
                  disabled={loading || (maxStock > 0 && newStock >= maxStock)}
                  className="w-10 h-10 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Validation Message */}
              {!stockValidation.isValid && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{stockValidation.message}</span>
                </div>
              )}

              {/* Max Stock Info */}
              {maxStock > 0 && stockValidation.isValid && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <Info className="w-4 h-4" />
                  <span>Tối đa: {maxStock} sản phẩm</span>
                </div>
              )}

              {/* Change indicator */}
              {newStock !== (product.stock || 0) && stockValidation.isValid && (
                <div className="text-center">
                  <span className={`text-sm font-medium ${
                    newStock > (product.stock || 0) 
                      ? 'text-green-600' 
                      : newStock < (product.stock || 0)
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                    {newStock > (product.stock || 0) 
                      ? `+${newStock - (product.stock || 0)}` 
                      : newStock < (product.stock || 0)
                      ? `${newStock - (product.stock || 0)}`
                      : 'Không thay đổi'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="px-6"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || newStock === (product?.stock || 0) || !stockValidation.isValid}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang cập nhật...
              </div>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
