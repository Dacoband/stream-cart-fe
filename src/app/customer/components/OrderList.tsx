import { useState, useEffect, useCallback } from 'react';
import { OrderItem } from './OrderItem';
import { Order } from '@/types/order/order';
import { getCustomerOrders, GetOrdersParams } from '@/services/api/order/customerOrder';
import { getStatusesForTab, OrderTabValue } from '@/types/order/orderStatus';
import Loading from '@/components/common/Loading';

interface OrderListProps {
  tabValue: OrderTabValue;
  accountId: string;
}

export function OrderList({ tabValue, accountId }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0
  });

  const fetchOrders = useCallback(async (pageIndex = 1, append = false) => {
    if (!accountId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const statuses = getStatusesForTab(tabValue);
      const params: GetOrdersParams = {
        accountId,
        PageIndex: pageIndex,
        PageSize: pagination.pageSize,
      };

      // Nếu không phải tab "tất cả" thì lọc theo status
      if (tabValue !== 'all' && statuses.length > 0) {
        // Vì API có thể chỉ hỗ trợ 1 status, ta sẽ gọi API nhiều lần và merge kết quả
        const allOrders: Order[] = [];
        
        for (const status of statuses) {
          const response = await getCustomerOrders({
            ...params,
            Status: status
          });
          allOrders.push(...response.items);
        }
        
        // Remove duplicates if any
        const uniqueOrders = allOrders.filter((order, index, self) =>
          index === self.findIndex(o => o.id === order.id)
        );
        
        setOrders(prev => append ? [...prev, ...uniqueOrders] : uniqueOrders);
        setPagination(prev => ({
          ...prev,
          totalCount: uniqueOrders.length,
          pageIndex: pageIndex
        }));
      } else {
        // Tab "tất cả" - lấy tất cả orders
        const response = await getCustomerOrders(params);
        setOrders(prev => append ? [...prev, ...response.items] : response.items);
        setPagination({
          pageIndex: response.currentPage,
          pageSize: response.pageSize,
          totalCount: response.totalCount
        });
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [accountId, tabValue, pagination.pageSize]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleLoadMore = () => {
    if (orders.length < pagination.totalCount) {
      fetchOrders(pagination.pageIndex + 1, true);
    }
  };

  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="flex justify-center py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => fetchOrders(1)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <p>Không có đơn hàng nào</p>
          <p className="text-sm mt-1">
            {tabValue === 'all' ? 'Bạn chưa có đơn hàng nào' : 'Không có đơn hàng nào ở trạng thái này'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderItem key={order.id} order={order} />
      ))}
      
      {orders.length < pagination.totalCount && (
        <div className="text-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Tải thêm'}
          </button>
        </div>
      )}
    </div>
  );
}
