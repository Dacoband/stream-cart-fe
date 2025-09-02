"use client";

import React, { useEffect, useState } from "react";
import { getCart } from "@/services/api/cart/cart";
import { Cart } from "@/types/Cart/Cart";
import { withRoleProtection } from "@/lib/requireRole";
import LoadingScreen from "@/components/common/LoadingScreen";
import EmptyCart from "./EmptyCart";
import ShoppingCart from "./ShoppingCart";

function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart();
        setCart(res);
        console.log("Fetch cart sucssess", res);
      } catch (err) {
        console.error("Fetch error api Cart", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading)
    return (
      <div>
        <LoadingScreen />
      </div>
    );

  if (!cart?.cartItemByShop || cart.cartItemByShop.length === 0)
    return (
      <div className="flex w-[70%] mx-auto h-full">
        <EmptyCart />
      </div>
    );

  return (
    <div className="w-[70%] mx-auto mt-10">
      <ShoppingCart cart={cart} />
    </div>
  );
}

export default withRoleProtection(CartPage, [1]);
