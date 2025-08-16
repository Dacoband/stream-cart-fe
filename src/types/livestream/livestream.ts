export interface Livestream {
  id: string;
  title: string;
  description: string;
  sellerId: string;
  sellerName: string;
  shopId: string;
  shopName: string;
  scheduledStartTime: Date; 
  actualStartTime: Date; 
  actualEndTime: Date | null;
  status: boolean;
  streamKey: string;
  playbackUrl: string;
  livekitRoomId: string;
  joinToken: string;
  thumbnailUrl: string;
  maxViewer: number | null;
  approvalStatusContent: boolean;
  approvedByUserId: string | null;
  approvalDateContent: string | null;
  isPromoted: boolean;
  tags: string;
  products: LivestreamProduct[];}
  export interface LivestreamProduct {
  id: string;
  livestreamId: string;
  productId: string;
  variantId: string;
  flashSaleId: string;
  isPin: boolean;
  price: number;
  stock: number;
  createdAt: string;
  lastModifiedAt: string;
  productName: string;
  productImageUrl: string;
  variantName: string;
}

export interface CreateLivestream {
  title: string;
  description: string;
  scheduledStartTime: Date; 
  thumbnailUrl: string;
  tags: string;
  livestreamHostId:string;
  products: CreateLivestreamProduct[];
}
export interface CreateLivestreamProduct {
  productId: string;
  variantId: string|null;
  price: number;
  stock: number;
  isPin: boolean;
}
 export interface UpdateLivestream {
  title: string;
  description: string;
  scheduledStartTime: Date; 
  thumbnailUrl: string;
  tags: string;
  
}