"use client";

import React, { useState, useEffect } from "react";
import { Review } from "@/types/review/review";
import { getProductReviews } from "@/services/api/review/review";
import { ProductDetail } from "@/types/product/product";
import { Star, ChevronLeft, ChevronRight, Filter, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "sonner";

interface ProductReviewProps {
  product: ProductDetail;
  onRatingChange?: (average: number, total: number) => void;
}

interface ReviewFilters {
  pageNumber: number;
  pageSize: number;
  minRating?: number;
  maxRating?: number;
  verifiedOnly?: boolean;
  sortBy?: string;
  ascending?: boolean;
}

function ProductReview({ product, onRatingChange }: ProductReviewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({});
  const [filters, setFilters] = useState<ReviewFilters>({
    pageNumber: 1,
    pageSize: 10,
    sortBy: "createdAt",
    ascending: false,
  });

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product.productId) return;

      try {
        setLoading(true);
        const response = await getProductReviews(product.productId, filters);

        // Handle different response structures
        let reviewsData: Review[] = [];
        let totalCount = 0;

        if (response?.data) {
          reviewsData = response.data.items || response.data || [];
          totalCount = response.data.totalCount || response.data.length || 0;
          setTotalPages(
            response.data.totalPages ||
              Math.ceil((response.data.totalCount || 0) / filters.pageSize)
          );
        } else if (Array.isArray(response)) {
          reviewsData = response;
          totalCount = response.length;
          setTotalPages(Math.ceil(response.length / filters.pageSize));
        }

        setReviews(reviewsData);
        setTotalReviews(totalCount);

        // Calculate average rating and rating counts from reviews data
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          const avgRating = totalRating / reviewsData.length;
          setAverageRating(avgRating);

          // Calculate rating counts
          const counts: Record<number, number> = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };
          reviewsData.forEach((review) => {
            if (review.rating >= 1 && review.rating <= 5) {
              counts[review.rating] = (counts[review.rating] || 0) + 1;
            }
          });
          setRatingCounts(counts);

          // Inform parent about the rating
          onRatingChange?.(avgRating, totalCount);
        } else {
          setAverageRating(0);
          setRatingCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
          onRatingChange?.(0, 0);
        }
      } catch (error) {
        console.error("Error fetching product reviews:", error);
        toast.error("Không thể tải đánh giá sản phẩm");
        setReviews([]);
        setTotalReviews(0);
        setTotalPages(0);
        setAverageRating(0);
        setRatingCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
        onRatingChange?.(0, 0);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [product.productId, filters, onRatingChange]);

  // Update filters
  const updateFilters = (newFilters: Partial<ReviewFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      pageNumber: newFilters.pageNumber || 1, // Reset to page 1 when changing filters
    }));
  };

  // Render star rating
  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
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
      month: "short",
      day: "numeric",
    });
  };

  // Calculate rating percentage
  const getRatingPercentage = (rating: number) => {
    if (totalReviews === 0) return 0;
    return ((ratingCounts[rating] || 0) / totalReviews) * 100;
  };

  if (loading) {
    return (
      <div className="mx-auto px-8">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-medium text-gray-800">
              Đánh Giá Sản Phẩm
            </span>
          </div>
        </div>
        <div className="p-4 space-y-4 mt-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-8">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-medium text-gray-800">
            Đánh Giá Sản Phẩm
          </span>
          <Badge variant="secondary">{totalReviews} đánh giá</Badge>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2">
        {/* Review Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-lg">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">
              {totalReviews > 0 ? averageRating.toFixed(1) : "0.0"}
            </div>
            <div className="mb-2">
              {renderStars(
                totalReviews > 0 ? Math.round(averageRating) : 0,
                20
              )}
            </div>
            <div className="text-gray-600">{totalReviews} đánh giá</div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm">{rating}</span>
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {ratingCounts[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center p-4 bg-white border rounded-lg">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="text-sm font-medium">Lọc theo:</span>
          </div>

          {/* Rating Filter */}
          <Select
            value={filters.minRating?.toString() || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                updateFilters({ minRating: undefined, maxRating: undefined });
              } else {
                const rating = parseInt(value);
                updateFilters({ minRating: rating, maxRating: rating });
              }
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tất cả sao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sao</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>

          {/* Verified Only */}
          <Select
            value={filters.verifiedOnly?.toString() || "all"}
            onValueChange={(value) => {
              updateFilters({
                verifiedOnly: value === "true" ? true : undefined,
              });
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tất cả đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đánh giá</SelectItem>
              <SelectItem value="true">Đã mua hàng</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={`${filters.sortBy}-${filters.ascending}`}
            onValueChange={(value) => {
              const [sortBy, ascending] = value.split("-");
              updateFilters({
                sortBy,
                ascending: ascending === "true",
              });
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-false">Mới nhất</SelectItem>
              <SelectItem value="createdAt-true">Cũ nhất</SelectItem>
              <SelectItem value="rating-false">Rating cao nhất</SelectItem>
              <SelectItem value="rating-true">Rating thấp nhất</SelectItem>
              <SelectItem value="helpfulCount-false">Hữu ích nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Star size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có đánh giá nào
              </h3>
              <p className="text-gray-500">
                Hãy là người đầu tiên đánh giá sản phẩm này
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {review.avatarImage ? (
                      <Image
                        src={review.avatarImage}
                        alt={review.reviewerName || "User"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">
                        {review.reviewerName || review.userName || "Người dùng"}
                      </span>
                    </div>

                    {/* Rating and Date */}
                    <div className="flex items-center gap-4 mb-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
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
                          .filter(
                            (url) =>
                              url &&
                              typeof url === "string" &&
                              url.trim() !== ""
                          )
                          .map((url, index) => (
                            <Image
                              key={index}
                              src={
                                url.startsWith("http")
                                  ? url
                                  : "/assets/emptyData.png"
                              }
                              alt={`Review image ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded border hover:opacity-75 transition-opacity cursor-pointer"
                            />
                          ))}
                      </div>
                    )}

                    {/* Helpful Count */}
                    {review.helpfulCount > 0 && (
                      <div className="text-sm text-gray-500">
                        {review.helpfulCount} người thấy hữu ích
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6">
            <div className="text-sm text-gray-600">
              Hiển thị {(filters.pageNumber - 1) * filters.pageSize + 1} -{" "}
              {Math.min(filters.pageNumber * filters.pageSize, totalReviews)}{" "}
              trong {totalReviews} đánh giá
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateFilters({ pageNumber: filters.pageNumber - 1 })
                }
                disabled={filters.pageNumber <= 1}
              >
                <ChevronLeft size={16} />
                Trước
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, filters.pageNumber - 2) + i;
                  if (page > totalPages) return null;

                  return (
                    <Button
                      key={page}
                      variant={
                        page === filters.pageNumber ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => updateFilters({ pageNumber: page })}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateFilters({ pageNumber: filters.pageNumber + 1 })
                }
                disabled={filters.pageNumber >= totalPages}
              >
                Sau
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductReview;
