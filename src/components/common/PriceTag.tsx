"use client";
import React from "react";

interface PriceTagProps {
  value: number;
  className?: string;
}

export default function PriceTag({ value, className = "" }: PriceTagProps) {
  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

  return <span className={className}>{formatted}</span>;
}
