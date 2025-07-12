"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCart } from "@/services/api/cart/cart";

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  resetCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    try {
      const data = await getCart();
      setCartCount(data.totalProduct || 0);
    } catch (err) {
      console.error("Không thể lấy giỏ hàng", err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const resetCart = () => setCartCount(0);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, resetCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart phải nằm trong CartProvider");
  return context;
};
