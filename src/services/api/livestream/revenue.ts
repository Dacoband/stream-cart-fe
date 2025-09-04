import rootApi from "@/services/rootApi";

export interface LivestreamRevenueProduct {
  productId: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  totalAmount: number;
  productImageUrl?: string;
}

export interface LivestreamRevenueData {
  livestreamId: string;
  totalRevenue: number;
  totalOrders: number;
  productsWithOrders: LivestreamRevenueProduct[];
}

export interface LivestreamRevenueResponse {
  success: boolean;
  message: string;
  data: LivestreamRevenueData;
  errors: string[];
}

/**
 * Lấy thống kê doanh thu của livestream
 */
export const getLivestreamRevenue = async (livestreamId: string): Promise<LivestreamRevenueData> => {
  try {
    const response = await rootApi.get<LivestreamRevenueResponse>(
      `orders/livestream/${livestreamId}/revenue`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Không thể lấy thống kê doanh thu");
    }

    return response.data.data;
  } catch (error) {
    console.error("Error fetching livestream revenue:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("Có lỗi xảy ra khi lấy thống kê doanh thu");
  }
};
