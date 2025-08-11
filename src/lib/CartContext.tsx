"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCart, createCart } from "@/services/api/cart/cart";
import { useAuth } from "@/lib/AuthContext";
import { CreateCart } from "@/types/Cart/Cart";

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  resetCart: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);
  const { user, loading } = useAuth();

  const refreshCart = async () => {
    try {
      const data = await getCart();
      setCartCount(data.totalProduct || 0);
    } catch (err) {
      console.error("Không thể lấy giỏ hàng", err);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    try {
      const cartData: CreateCart = {
        productId,
        variantId: null, // Mặc định null nếu không có variant
        quantity,
      };

      await createCart(cartData);
      await refreshCart(); // Refresh để cập nhật số lượng
      return true;
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!loading && user?.role === 1) {
      refreshCart();
    }
  }, [user, loading]);

  const resetCart = () => setCartCount(0);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, resetCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart phải nằm trong CartProvider");
  return context;
};
