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

import { Voucher } from '@/types/voucher/voucher';

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
