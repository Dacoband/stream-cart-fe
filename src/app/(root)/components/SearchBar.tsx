"use client";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") || "";
  const currentType = searchParams.get("type") || "product";
  const [value, setValue] = React.useState(initial);
  const [typing, setTyping] = React.useState(false);

  const triggerSearch = React.useCallback(
    (term: string) => {
      const t = term.trim();
      if (!t) return;
      router.push(`/search?type=${currentType}&q=${encodeURIComponent(t)}`);
    },
    [router, currentType]
  );

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      triggerSearch(value);
    }
  };

  return (
    <Suspense fallback={null}>
      <div className="flex items-center gap-2 ml-8">
        <div className="relative w-2xl max-w-[640px]">
          <Input
            type="text"
            onFocus={() => setTyping(true)}
            onBlur={() => setTimeout(() => setTyping(false), 150)}
            placeholder="Tìm kiếm sản phẩm, cửa hàng..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full pr-20 py-5 bg-white text-black text-base md:text-lg rounded-sm focus-visible:ring-1 focus-visible:ring-[#B0F847]"
          />
          {value && (
            <button
              aria-label="Clear"
              onClick={() => setValue("")}
              className="absolute top-0 right-12 h-full flex items-center justify-center px-1 text-slate-500 hover:text-black"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => triggerSearch(value)}
            className="absolute top-0 right-0 h-full flex items-center justify-center px-5 bg-gradient-to-r from-[#B0F847] via-[#c6ef88] to-[#B0F847] cursor-pointer rounded-r-md hover:brightness-105 active:scale-[0.98] transition"
            aria-label="Tìm kiếm"
          >
            <Search size={20} className="text-black" />
          </button>
          {typing && value.trim() && (
            <div className="absolute mt-1 w-full bg-white border rounded-sm shadow z-20 max-h-72 overflow-y-auto text-sm">
              <div className="p-2 text-slate-500 italic">
                Nhấn Enter để tìm “{value.trim()}”
              </div>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
