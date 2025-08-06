// Test file to verify API functionality
// This file is for testing purposes only

import { getCustomerOrders } from '@/services/api/order/customerOrder';

// Test function - remove this in production
export async function testOrderAPI() {
  try {
    const testAccountId = "3ad142a6-1d10-40f4-81f0-d69d8ae6033e";
    
    console.log("Testing API with account ID:", testAccountId);
    
    // Test getting all orders
    const allOrders = await getCustomerOrders({
      accountId: testAccountId,
      PageIndex: 1,
      PageSize: 10
    });
    
    console.log("All orders response:", allOrders);
    
    // Test getting orders with specific status
    const waitingOrders = await getCustomerOrders({
      accountId: testAccountId,
      PageIndex: 1,
      PageSize: 10,
      Status: 0 // Waiting status
    });
    
    console.log("Waiting orders response:", waitingOrders);
    
    return {
      success: true,
      allOrders,
      waitingOrders
    };
  } catch (error) {
    console.error("API test failed:", error);
    return {
      success: false,
      error
    };
  }
}

// You can call this in the browser console:
// testOrderAPI().then(result => console.log("Test result:", result));
