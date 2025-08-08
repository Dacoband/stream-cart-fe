"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getAllCategoriesForHome } from "@/services/api/categories/categorys";
import { Category } from "@/types/category/category";
import { Skeleton } from "@/components/ui/skeleton";

function chunkArray<T>(arr: T[], chunkSize: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

function CategoryComponent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllCategoriesForHome();
        setCategories(res.categories || []);
      } catch (error) {
        console.error("Fetch Categoryes errors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chunked = chunkArray(categories, 16);

  return (
    <div className="flex flex-col px-10 py-5 w-full bg-white rounded-xl shadow">
      <span className="text-left text-xl font-semibold text-gray-500 ml-2">
        DANH MỤC
      </span>
      {loading ? (
        <div className="grid grid-cols-8 gap-x-5 gap-y-10 pt-2 mb-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : (
        <Carousel className="w-full pt-2">
          <CarouselContent>
            {chunked.map((group, idx) => {
              const firstRow = group.slice(0, 8);
              const secondRow = group.slice(8, 16);

              return (
                <CarouselItem key={idx}>
                  <div className="flex flex-col gap-4 py-2 px-2">
                    {[firstRow, secondRow].map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid grid-cols-8 gap-4 justify-items-center"
                      >
                        {row.map((cat) => (
                          <div
                            key={cat.categoryId}
                            className="flex flex-col w-full items-center justify-center cursor-pointer hover:scale-105 transition border border-gray-300 rounded-md p-2 hover:shadow-lg hover:font-medium"
                          >
                            <div className="w-20 h-20 mb-2 bg-white flex items-center justify-center overflow-hidden">
                              {cat.iconURL ? (
                                <Image
                                  src={cat.iconURL}
                                  alt={cat.categoryName}
                                  width={96}
                                  height={96}
                                  className="object-center"
                                />
                              ) : (
                                <Skeleton className="w-20 h-20" />
                              )}
                            </div>

                            <span className="text-base text-center text-gray-700">
                              {cat.categoryName}
                            </span>
                          </div>
                        ))}

                        {/* Thêm ô trống nếu thiếu item để đủ 8 cột */}
                        {Array.from({ length: 8 - row.length }).map((_, i) => (
                          <div key={`empty-${rowIndex}-${i}`} />
                        ))}
                      </div>
                    ))}
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </div>
  );
}

export default CategoryComponent;
