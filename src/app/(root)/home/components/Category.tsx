import React from "react";
import { categories } from "@/fake data/category";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function chunkArray<T>(arr: T[], chunkSize: number) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

function Category() {
  const chunked = chunkArray(categories, 16);

  return (
    <div className="flex flex-col px-10 py-5 w-full bg-white rounded-xl shadow">
      <span className="text-left text-xl font-semibold text-gray-500 ml-2">
        DANH MỤC
      </span>

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
                          key={cat.id}
                          className="flex flex-col w-full items-center justify-center cursor-pointer hover:scale-105 transition border border-gray-300 rounded-md p-2 hover:shadow-lg hover:font-medium"
                        >
                          <div className="w-20 h-20 mb-2 bg-white flex items-center justify-center overflow-hidden">
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              width={96}
                              height={96}
                              className="object-center"
                            />
                          </div>
                          <span className="text-base text-center text-gray-700">
                            {cat.name}
                          </span>
                        </div>
                      ))}

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
    </div>
  );
}

export default Category;
