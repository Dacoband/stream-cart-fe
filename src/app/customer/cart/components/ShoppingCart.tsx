import { Card } from "@/components/ui/card";
import { Cart } from "@/types/Cart/Cart";
import React from "react";
interface ShoppingCartProps {
  cart: Cart;
}
function ShoppingCart({ cart }: ShoppingCartProps) {
  return (
    <div className="w-full">
      <Card></Card>
    </div>
  );
}

export default ShoppingCart;
