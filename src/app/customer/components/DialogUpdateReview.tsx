"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, X } from "lucide-react";
import { updateReview, getReview } from "@/services/api/review/review";
import { uploadImage } from "@/services/api/uploadImage";
import { toast } from "sonner";
import Image from "next/image";
import { Review } from "@/types/review/review";

interface DialogUpdateReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string | null;
  onSuccess?: () => void;
}

export function DialogUpdateReview({
  open,
  onOpenChange,
  reviewId,
  onSuccess,
}: DialogUpdateReviewProps) {
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch review data when dialog opens
  useEffect(() => {
    const fetchReview = async () => {
      if (!open || !reviewId) return;
      
      try {
        setLoading(true);
        const reviewData = await getReview(reviewId);
        setReview(reviewData);
        setRating(reviewData.rating);
        setReviewText(reviewData.reviewText || "");
        setImageUrls(reviewData.imageUrls || []);
      } catch (error) {
        console.error("Error fetching review:", error);
        toast.error("Không thể tải thông tin đánh giá");
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [open, reviewId, onOpenChange]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setReview(null);
      setRating(5);
      setReviewText("");
      setImageUrls([]);
      setLoading(false);
      setSubmitting(false);
      setUploading(false);
    }
  }, [open]);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.type.startsWith("image/")) {
          const response = await uploadImage(file);
          return response.url || response.imageUrl || response;
        }
        return null;
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(url => url !== null) as string[];
      
      setImageUrls(prev => [...prev, ...validUrls]);
      toast.success(`Đã upload ${validUrls.length} ảnh thành công`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Lỗi upload ảnh, vui lòng thử lại");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reviewId) {
      toast.error("Không tìm thấy ID đánh giá");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    setSubmitting(true);
    
    try {
      await updateReview(reviewId, {
        rating,
        reviewText,
        imageUrls,
      });

      toast.success("Đã cập nhật đánh giá thành công!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Không thể cập nhật đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            className="transition-colors"
          >
            <Star
              size={24}
              className={
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
        </DialogHeader>

        {review && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {review.productImageUrl && (
                <Image
                  src={review.productImageUrl.startsWith('http') 
                    ? review.productImageUrl 
                    : '/assets/emptyData.png'}
                  alt={review.productName || "Product"}
                  width={60}
                  height={60}
                  className="w-15 h-15 object-cover rounded border"
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  {review.productName || "Sản phẩm"}
                </h3>
                {review.orderCode && (
                  <p className="text-sm text-gray-500">
                    Đơn hàng: {review.orderCode}
                  </p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Đánh giá của bạn <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {renderStars()}
                <span className="text-sm text-gray-600 ml-2">
                  {rating}/5 sao
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Chia sẻ cảm nhận của bạn
              </label>
              <Textarea
                placeholder="Viết đánh giá về chất lượng sản phẩm, dịch vụ giao hàng, đóng gói..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Hình ảnh đánh giá</label>
              
              {/* Current Images */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={url.startsWith('http') ? url : '/assets/emptyData.png'}
                        alt={`Review image ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  disabled={uploading}
                >
                  <Upload size={16} className="mr-2" />
                  {uploading ? "Đang upload..." : "Thêm hình ảnh"}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="flex-1 bg-lime-600 hover:bg-lime-700"
              >
                {submitting ? "Đang cập nhật..." : "Cập nhật đánh giá"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
