"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, X } from "lucide-react";
import { createReview } from "@/services/api/review/review";
import { toast } from "sonner";
import Image from "next/image";
import { Order } from "@/types/order/order";

interface DialogAddReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onSuccess?: () => void;
}

export function DialogAddReview({
  open,
  onOpenChange,
  order,
  onSuccess,
}: DialogAddReviewProps) {
  const [reviews, setReviews] = useState<
    Record<
      string,
      {
        rating: number;
        reviewText: string;
        imageUrls: string[];
      }
    >
  >({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize reviews state for all items when dialog opens
  React.useEffect(() => {
    if (open && order.items) {
      const initialReviews: typeof reviews = {};
      order.items.forEach((item) => {
        if (item.productId) {
          initialReviews[item.productId] = {
            rating: 5,
            reviewText: "",
            imageUrls: [],
          };
        }
      });
      setReviews(initialReviews);
    }
  }, [open, order.items]);

  const updateReview = (
    productId: string,
    field: "rating" | "reviewText" | "imageUrls",
    value: number | string | string[]
  ) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleStarClick = (productId: string, rating: number) => {
    updateReview(productId, "rating", rating);
  };

  const handleImageUpload = (productId: string, files: FileList | null) => {
    if (!files) return;
    const urls: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        urls.push(URL.createObjectURL(file));
      }
    });
    
    updateReview(productId, "imageUrls", [
      ...reviews[productId]?.imageUrls || [],
      ...urls,
    ]);
    
    toast.success(`Đã thêm ${urls.length} ảnh`);
  };

  const removeImage = (productId: string, index: number) => {
    const currentImages = reviews[productId]?.imageUrls || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    updateReview(productId, "imageUrls", newImages);
  };

  const handleSubmit = async () => {
    if (!order.items || order.items.length === 0) {
      toast.error("Không có sản phẩm để đánh giá");
      return;
    }

    setSubmitting(true);
    
    try {
      // Submit reviews for all products in the order
      const promises = order.items.map(async (item) => {
        if (!item.productId) return;
        
        const review = reviews[item.productId];
        if (!review) return;

        await createReview({
          orderID: order.id,
          productID: item.productId,
          livestreamId: null,
          rating: review.rating,
          reviewText: review.reviewText.trim() || null,
          imageUrls: review.imageUrls.length > 0 ? review.imageUrls : null,
        });
      });

      await Promise.all(promises);
      
      toast.success("Đã gửi đánh giá thành công!");
      onOpenChange(false);
      onSuccess?.();
      
      // Clear reviews state
      setReviews({});
      
    } catch (error) {
      console.error("Error submitting reviews:", error);
      toast.error("Có lỗi khi gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  if (!order.items || order.items.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {order.items.map((item) => {
            if (!item.productId) return null;
            
            const review = reviews[item.productId] || {
              rating: 5,
              reviewText: "",
              imageUrls: [],
            };
            
            return (
              <div key={item.id} className="border-b pb-6 last:border-b-0">
                {/* Product Info */}
                <div className="flex gap-3 mb-4">
                  <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100">
                    <Image
                      src={item.productImageUrl || "/assets/emptyData.png"}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">
                      {item.productName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Số lượng: {item.quantity}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Đánh giá sao:
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(item.productId!, star)}
                        className="transition-colors"
                      >
                        <Star
                          size={24}
                          className={
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Nhận xét của bạn:
                  </label>
                  <Textarea
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    value={review.reviewText}
                    onChange={(e) =>
                      updateReview(item.productId!, "reviewText", e.target.value)
                    }
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Hình ảnh sản phẩm (tùy chọn):
                  </label>
                  
                  {/* Uploaded Images */}
                  {review.imageUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {review.imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="w-full aspect-square rounded overflow-hidden bg-gray-100">
                            <Image
                              src={url}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(item.productId!, index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(item.productId!, e.target.files)
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed"
                    >
                      <Upload size={16} className="mr-2" />
                      Thêm hình ảnh
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#B0F847] text-black hover:brightness-95"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
