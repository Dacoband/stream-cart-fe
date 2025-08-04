"use client";

import React, { useEffect, useState } from 'react';
import rootApi from '@/services/rootApi';

interface TestAPIProps {
  shopId: string;
}

function TestAPI({ shopId }: TestAPIProps) {
  const [shopData, setShopData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testAPIs = async () => {
      try {
        console.log('🔥 Testing APIs for shopId:', shopId);
        
        // Test shop API
        try {
          const shopResponse = await rootApi.get(`shops/${shopId}`);
          console.log('🏪 Shop API Response:', shopResponse.data);
          setShopData(shopResponse.data);
        } catch (shopError) {
          console.error('❌ Shop API Error:', shopError);
        }

        // Test products API  
        try {
          const productsResponse = await rootApi.get(`products/shop/${shopId}`, {
            params: {
              pageNumber: 1,
              pageSize: 10
            }
          });
          console.log('📦 Products API Response:', productsResponse.data);
          setProductsData(productsResponse.data);
        } catch (productError) {
          console.error('❌ Products API Error:', productError);
        }

      } catch (error) {
        console.error('💥 General API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      testAPIs();
    }
  }, [shopId]);

  if (loading) return <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500">🔄 Testing APIs...</div>;

  return (
    <div className="p-4 bg-gray-100 m-4 rounded border">
      <h2 className="text-xl font-bold mb-4 text-blue-600">🧪 API Test Results:</h2>
      
      <div className="mb-6">
        <h3 className="font-bold text-green-600 mb-2">🏪 Shop Data:</h3>
        <div className="bg-white p-3 rounded border max-h-64 overflow-auto">
          <pre className="text-xs">
            {shopData ? JSON.stringify(shopData, null, 2) : 'No shop data'}
          </pre>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold text-purple-600 mb-2">📦 Products Data:</h3>
        <div className="bg-white p-3 rounded border max-h-64 overflow-auto">
          <pre className="text-xs">
            {productsData ? JSON.stringify(productsData, null, 2) : 'No products data'}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default TestAPI;
