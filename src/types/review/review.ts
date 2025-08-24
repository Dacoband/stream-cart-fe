export interface CreateReview {
  orderID: string | null;
  productID: string | null;
  livestreamId: string | null;
  rating: number | null;
  reviewText: string | null;
  imageUrls: string[] | null;
}
