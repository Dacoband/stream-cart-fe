import rootApi from "../../rootApi";

export interface OrderSearchParams {
  AccountId?: string;
  ShopId?: string;
  OrderStatus?: number;
  PaymentStatus?: number;
  StartDate?: string;
  EndDate?: string;
  SearchTerm?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface OrderSearchResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: Order[];
}

export interface Order {
  id: string;
  orderCode: string;
  orderDate: string;
  orderStatus: number;
  paymentStatus: number;
  totalPrice: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  customerNotes: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate: string | null;
  trackingCode: string;
  paymentMethod: string;
  timeForShop: string | null;
  shippingAddress: ShippingAddress;
  accountId: string;
  shopId: string;
  shippingProviderId: string;
  livestreamId: string | null;
  voucherCode: string | null;
  items: OrderItem[];
  netAmount: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  ward: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  state: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
  notes: string;
  refundRequestId: string | null;
  productName: string;
  productImageUrl: string;
}

export const searchOrders = async (params?: OrderSearchParams): Promise<OrderSearchResponse> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

    const queryParams = new URLSearchParams();
    
    if (params?.AccountId) queryParams.set("AccountId", params.AccountId);
    if (params?.ShopId) queryParams.set("ShopId", params.ShopId);
    if (params?.OrderStatus !== undefined) queryParams.set("OrderStatus", String(params.OrderStatus));
    if (params?.PaymentStatus !== undefined) queryParams.set("PaymentStatus", String(params.PaymentStatus));
    if (params?.StartDate) queryParams.set("StartDate", params.StartDate);
    if (params?.EndDate) queryParams.set("EndDate", params.EndDate);
    if (params?.SearchTerm) queryParams.set("SearchTerm", params.SearchTerm);
    if (params?.PageNumber) queryParams.set("PageNumber", String(params.PageNumber));
    if (params?.PageSize) queryParams.set("PageSize", String(params.PageSize));

    const url = `orders/search${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    
    const response = await rootApi.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error searching orders:", error);
    throw error;
  }
};

// Helper function to get orders by specific criteria
export const getOrdersByStatus = async (
  orderStatus: number,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<OrderSearchResponse> => {
  return searchOrders({
    OrderStatus: orderStatus,
    PageNumber: pageNumber,
    PageSize: pageSize,
  });
};

export const getOrdersByShopAndStatus = async (
  shopId: string,
  orderStatus?: number,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<OrderSearchResponse> => {
  return searchOrders({
    ShopId: shopId,
    OrderStatus: orderStatus,
    PageNumber: pageNumber,
    PageSize: pageSize,
  });
};

export const getOrdersByAccount = async (
  accountId: string,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<OrderSearchResponse> => {
  return searchOrders({
    AccountId: accountId,
    PageNumber: pageNumber,
    PageSize: pageSize,
  });
};

export const searchOrdersByTerm = async (
  searchTerm: string,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<OrderSearchResponse> => {
  return searchOrders({
    SearchTerm: searchTerm,
    PageNumber: pageNumber,
    PageSize: pageSize,
  });
};

// Function to calculate completion rate (Status 4 + 10 / Total orders)
export const getOrderCompletionRate = async (shopId: string): Promise<number> => {
  try {
    // Get total orders for the shop
    const totalOrdersResponse = await searchOrders({
      ShopId: shopId,
      PageSize: 1, // Only need count
    });

    // Get completed orders (Status 4: Delivered + Status 10: Completed)
    const [deliveredOrders, completedOrders] = await Promise.all([
      searchOrders({ ShopId: shopId, OrderStatus: 4, PageSize: 1 }), // Delivered
      searchOrders({ ShopId: shopId, OrderStatus: 10, PageSize: 1 }), // Completed
    ]);

    const totalOrders = totalOrdersResponse.totalCount;
    const completedOrdersCount = deliveredOrders.totalCount + completedOrders.totalCount;

    // Calculate percentage (avoid division by zero)
    if (totalOrders === 0) return 0;
    
    const completionRate = (completedOrdersCount / totalOrders) * 100;
    return Math.round(completionRate * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error("Error calculating order completion rate:", error);
    return 0;
  }
};
