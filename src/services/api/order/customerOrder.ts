import rootApi from '../../rootApi';
import { Order } from '@/types/order/order';

export interface GetOrdersParams {
  accountId: string;
  PageIndex?: number;
  PageSize?: number;
  Status?: number;
}

export interface GetOrdersResponse {
  items: Order[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export const getCustomerOrders = async (params: GetOrdersParams): Promise<GetOrdersResponse> => {
  try {
    const { accountId, ...queryParams } = params;
    const response = await rootApi.get(`orders/account/${accountId}`, {
      params: queryParams
    });
    
    console.log("API Response:", response.data);
    
    // Transform the response to match our expected interface
    return {
      items: response.data.items || [],
      totalCount: response.data.totalCount || 0,
      currentPage: response.data.currentPage || 1,
      pageSize: response.data.pageSize || 10,
      totalPages: response.data.totalPages || 0,
      hasPrevious: response.data.hasPrevious || false,
      hasNext: response.data.hasNext || false
    };
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    throw error;
  }
};