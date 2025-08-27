export interface CreateReview {
  orderID: string | null;
  productID: string | null;
  livestreamId: string | null;
  rating: number | null;
  reviewText: string | null;
  imageUrls: string[] | null;
}
export interface Review {
  id: string;
  orderID: string | null;
  productID: string | null;
  livestreamId: string | null;
  accountID: string;
  rating: number;
  reviewText: string;
  isVerifiedPurchase: boolean;
  type: number;
  typeDisplayName: string;
  imageUrls: string[];
  createdAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
  helpfulCount: number;
  unhelpfulCount: number;
  productName: string | null;
  productImageUrl: string | null;
  orderCode: string | null;
  livestreamTitle: string | null;
  reviewerName: string | null;
  shopName: string | null;
  avatarImage: string | null;
  userName: string | null;
}
