"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  Search, 
  Calendar,
  Package,
  Edit3,
  Trash2
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getUserReviews, deleteReview } from "@/services/api/review/review";
import { Review } from "@/types/review/review";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DialogUpdateReview } from "@/app/customer/components/DialogUpdateReview";

function MyReviewPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<string | null>(null);

  // Fetch user reviews
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await getUserReviews(user.id);
        const reviewsData = response?.data || response || [];
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (error) {
        console.error("Error fetching user reviews:", error);
        toast.error("Không thể tải đánh giá của bạn");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [user?.id]);

  // Filter reviews based on search term
  const filteredReviews = reviews.filter(review => 
    review.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.reviewText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.orderCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    try {
      setDeleting(true);
      await deleteReview(reviewToDelete);
      setReviews(prev => prev.filter(review => review.id !== reviewToDelete));
      toast.success("Đã xóa đánh giá thành công");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Không thể xóa đánh giá");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const openDeleteDialog = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (reviewId: string) => {
    setReviewToEdit(reviewId);
    setEditDialogOpen(true);
  };

  const refreshReviews = async () => {
    if (!user?.id) return;
    
    try {
      const response = await getUserReviews(user.id);
      const reviewsData = response?.data || response || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="flex flex-col py-8 px-10 w-full h-full overflow-auto min-h-[calc(100vh-9rem)]">
        <div className="flex justify-between items-center border-b pb-4 mb-5">
          <div>
            <div className="text-xl font-semibold">Đánh giá của bạn</div>
            <span className="text-muted-foreground text-sm">
              Quản lý đánh giá của bạn
            </span>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex flex-col py-8 px-10 w-full h-full overflow-auto min-h-[calc(100vh-9rem)]">
        <div className="flex justify-between items-center border-b pb-4 mb-5">
          <div>
            <div className="text-xl font-semibold">Đánh giá của bạn</div>
            <span className="text-muted-foreground text-sm">
              Quản lý đánh giá của bạn
            </span>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredReviews.length} đánh giá
          </Badge>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên sản phẩm, nội dung đánh giá hoặc mã đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Không tìm thấy đánh giá nào" : "Bạn chưa có đánh giá nào"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Thử tìm kiếm với từ khóa khác" 
                  : "Hãy mua sắm và đánh giá sản phẩm để chia sẻ trải nghiệm với mọi người"}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {review.productImageUrl && (
                          <Image
                            src={review.productImageUrl.startsWith('http') 
                              ? review.productImageUrl 
                              : '/assets/emptyData.png'}
                            alt={review.productName || "Product"}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded border"
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
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(review.id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Chỉnh sửa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDeleteDialog(review.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>

                  {/* Rating and Date */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium">{review.rating}/5</span>
                      {review.isVerifiedPurchase && (
                        <Badge variant="secondary" className="text-xs">
                          Đã mua hàng
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.reviewText && (
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {review.reviewText}
                    </p>
                  )}

                  {/* Review Images */}
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.imageUrls
                        .filter(url => url && typeof url === 'string' && url.trim() !== '')
                        .map((url, index) => (
                        <Image
                          key={index}
                          src={url.startsWith('http') ? url : '/assets/emptyData.png'}
                          alt={`Review image ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded border hover:opacity-75 transition-opacity cursor-pointer"
                        />
                      ))}
                    </div>
                  )}

                  {/* Shop info */}
                  {review.shopName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t">
                      <span>Cửa hàng:</span>
                      <span className="font-medium">{review.shopName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Review Dialog */}
      <DialogUpdateReview
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        reviewId={reviewToEdit}
        onSuccess={refreshReviews}
      />
    </>
  );
}

export default MyReviewPage;
