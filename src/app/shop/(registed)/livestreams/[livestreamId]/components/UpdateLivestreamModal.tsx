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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Edit3, ImageIcon, Tag, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { updateLivestream } from "@/services/api/livestream/livestream";
import { uploadImage } from "@/services/api/uploadImage";
import type { Livestream, UpdateLivestream } from "@/types/livestream/livestream";

interface UpdateLivestreamModalProps {
  open: boolean;
  livestream: Livestream | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateLivestreamModal({
  open,
  livestream,
  onClose,
  onSuccess,
}: UpdateLivestreamModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<UpdateLivestream>({
    title: "",
    description: "",
    scheduledStartTime: new Date(),
    thumbnailUrl: "",
    tags: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Reset form data when livestream changes
  useEffect(() => {
    if (livestream) {
      setFormData({
        title: livestream.title || "",
        description: livestream.description || "",
        scheduledStartTime: new Date(livestream.scheduledStartTime),
        thumbnailUrl: livestream.thumbnailUrl || "",
        tags: livestream.tags || "",
      });
      setImagePreview(livestream.thumbnailUrl || "");
      setImageFile(null);
    }
  }, [livestream]);

  const handleInputChange = (
    field: keyof UpdateLivestream,
    value: string | Date
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Vui lòng chọn file hình ảnh hợp lệ");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(formData.thumbnailUrl || "");
  };

  const formatDateForInput = (date: Date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const handleSubmit = async () => {
    if (!livestream) return;

    // Validation
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề livestream");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả livestream");
      return;
    }

    try {
      setLoading(true);
      
      let thumbnailUrl = formData.thumbnailUrl;
      
      // Upload new image if selected
      if (imageFile) {
        setUploading(true);
        try {
          const uploadResponse = await uploadImage(imageFile);
          console.log("Upload response:", uploadResponse); // Debug log
          
          // Extract image URL from response
          thumbnailUrl = uploadResponse.imageUrl || uploadResponse.data?.imageUrl || uploadResponse.url || uploadResponse.data?.url;
          
          if (!thumbnailUrl) {
            throw new Error("Không nhận được URL hình ảnh từ server");
          }
          
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          const uploadErrorMessage = uploadError instanceof Error ? uploadError.message : "Lỗi không xác định";
          toast.error(`Tải lên hình ảnh thất bại: ${uploadErrorMessage}`);
          return;
        } finally {
          setUploading(false);
        }
      }

      const updateData = {
        ...formData,
        thumbnailUrl,
      };
            
      await updateLivestream(livestream.id, updateData);
      
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      toast.error(`Cập nhật livestream thất bại: ${errorMessage}`);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !uploading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Edit3 className="w-5 h-5 text-blue-600" />
            Cập nhật LiveStream
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin livestream của bạn. Các thay đổi sẽ được lưu ngay lập tức.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
              <Edit3 className="w-4 h-4 text-gray-600" />
              Tiêu đề livestream
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Nhập tiêu đề cho livestream..."
              className="w-full"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
              <Edit3 className="w-4 h-4 text-gray-600" />
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về livestream của bạn..."
              className="w-full min-h-[100px] resize-none"
              disabled={loading}
            />
          </div>

          {/* Scheduled Start Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduledStartTime" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-gray-600" />
              Thời gian dự kiến bắt đầu
            </Label>
            <div className="relative">
              <Input
                id="scheduledStartTime"
                type="datetime-local"
                value={formatDateForInput(formData.scheduledStartTime)}
                onChange={(e) => handleInputChange("scheduledStartTime", new Date(e.target.value))}
                className="w-full"
                disabled={loading}
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Thumbnail Image Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="w-4 h-4 text-gray-600" />
              Hình ảnh thumbnail
            </Label>
            
            {/* Current Image Display */}
            {imagePreview && (
              <div className="relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Thumbnail preview"
                  width={200}
                  height={120}
                  className="w-50 h-30 object-cover rounded-lg border"
                  onError={() => setImagePreview("")}
                />
                {imageFile && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    disabled={loading || uploading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Upload Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="thumbnail-upload"
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer
                    hover:bg-gray-50 transition-colors text-sm font-medium
                    ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Upload className="w-4 h-4" />
                  {imageFile ? "Thay đổi hình ảnh" : "Chọn hình ảnh"}
                </label>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading || uploading}
                />
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Đang tải lên...
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Chọn file hình ảnh (JPG, PNG, GIF). Tối đa 5MB.
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center gap-2 text-sm font-medium">
              <Tag className="w-4 h-4 text-gray-600" />
              Tags
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="Nhập các tag cho livestream..."
              className="w-full"
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Sử dụng tags để giúp người xem dễ dàng tìm thấy livestream của bạn
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading || uploading}
            className="px-6"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="px-6 bg-blue-600 hover:bg-blue-700"
          >
            {loading || uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploading ? "Đang tải ảnh..." : "Đang cập nhật..."}
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
