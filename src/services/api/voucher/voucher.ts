import { SearchVoucher } from './../../../types/voucher/voucher';
import rootApi from '@/services/rootApi';

export interface CreateVoucherDTO {
  code: string;
  description?: string;
  type: number; 
  value: number;
  maxValue?: number|null;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  availableQuantity: number;
}

export const createVoucher = async (data: CreateVoucherDTO) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const res = await rootApi.post('/vouchers', data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error) {
    console.error('Error creating voucher:', error);
    throw error;
  }
};
export const updateVoucher = async (id: string, data: UpdateVoucher) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const res = await rootApi.put(`/vouchers/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error) {
    console.error('Error creating voucher:', error);
    throw error;
  }
};
import { UpdateVoucher, Voucher } from '@/types/voucher/voucher';

export interface VoucherListResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  items: Voucher[];
}

export const getVouchersByShop = async (
  shopId: string,
  params?: { isActive?: boolean; type?: number; isExpired?: boolean; pageNumber?: number; pageSize?: number }
) => {
  try {
    const response = await rootApi.get(`/shops/${shopId}/vouchers`, { params });
    return response.data.data as VoucherListResponse;
  } catch (error) {
    console.error('Error fetching vouchers by shop:', error);
    throw error;
  }
};
export const deleteVoucherById = async (voucherId:string) => {
  try{
 
const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Not found token.");
    }

  const response = await rootApi.delete(`vouchers/${voucherId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data}
   catch (error) {
    console.error("Error delete voucher:", error);
    throw error;
  }
}
export const addVoucherByShop = async (data:SearchVoucher) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not found token.");

    const response = await rootApi.post(
      `/vouchers/available`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error fetching voucher by order ID:", error);
    throw error;
  }
};