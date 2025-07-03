"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
export default function OperationProduct() {
  // Dữ liệu giả
  const productImages = [
    "https://i.pinimg.com/736x/60/60/84/6060845043116103ef9e46cac33be495.jpg",
    "https://i.pinimg.com/736x/60/60/84/6060845043116103ef9e46cac33be495.jpg",
    "https://i.pinimg.com/736x/53/85/7f/53857f9165d995e2818ed44a9f5e769e.jpg",
    "https://i.pinimg.com/736x/4c/fe/0e/4cfe0e0e51c3441d28d39015224fdd97.jpg",
    "https://i.pinimg.com/736x/4c/fe/0e/4cfe0e0e51c3441d28d39015224fdd97.jpg",
  ];

  const colors = ["35cm", "50cm", "80cm", "100cm"];
  const sizes = [
    {
      id: 1,
      size: "Màu sữa",
      image:
        "https://i.pinimg.com/736x/60/60/84/6060845043116103ef9e46cac33be495.jpg",
    },
    {
      id: 3,
      size: "Màu trắng",
      image:
        "https://i.pinimg.com/736x/60/60/84/6060845043116103ef9e46cac33be495.jpg",
    },
    {
      id: 2,
      size: "Màu hồng",
      image:
        "https://i.pinimg.com/736x/4c/fe/0e/4cfe0e0e51c3441d28d39015224fdd97.jpg",
    },
    {
      id: 4,
      size: "Màu nâu",
      image:
        "https://i.pinimg.com/736x/53/85/7f/53857f9165d995e2818ed44a9f5e769e.jpg",
    },
    {
      id: 5,
      size: "Màu be",
      image:
        "https://i.pinimg.com/736x/53/85/7f/53857f9165d995e2818ed44a9f5e769e.jpg",
    },
  ];

  // State
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className=" mx-auto px-8  pb-8">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Product Images */}
        <div className="space-y-4 w-2/5  ">
          <div className="aspect-square w-full mb-5 bg-white rounded-lg overflow-hidden border mx-auto">
            <Image
              src={productImages[selectedImage]}
              alt="Product Image"
              width={500}
              height={500}
              quality={90}
              className=" h-full w-full object-cover"
            />
          </div>
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              slidesToScroll: 1,
            }}
          >
            <CarouselContent className="flex">
              {productImages.map((image, index) => (
                <CarouselItem key={index} className="basis-1/4">
                  <button
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-full bg-white  cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === index
                        ? "border-green-500"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Product Image ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 group-hover:block bg-black/50 text-white w-8" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 group-hover:block bg-black/50 text-white w-8" />
          </Carousel>
        </div>

        {/* Product Info */}
        <div className="space-y-6 w-3/5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Gấu bông Bonnie lông mềm Quãng Châu
            </h1>
            <div className="flex items-center space-x-4 mb-4 ">
              <div className="flex items-center gap-1 ">
                <span className="   text-gray-600">Đánh giá:</span>
                <span className="  font-medium ">4.8</span>
                <Star
                  className="w-5 h-5 
                     fill-yellow-400 text-yellow-400  "
                />
              </div>

              <div className="flex items-end gap-1">
                <span className="   text-gray-600">Đã bán:</span>
                <span className="   font-medium">20</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-red-600">299.000đ</span>
              <span className="text-lg text-gray-500 line-through">
                ₫399.000
              </span>
            </div>
          </div>

          <div>
            <div className="w-full flex gap-3 mb-6">
              <div className=" text-gray-600 font-semibold w-[110px] h-10 flex items-center ">
                Kích thước
              </div>
              <div className="flex-1 grid-flow-col space-x-2.5">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 rounded-lg text-sm cursor-pointer font-medium mb-4 ${
                      selectedColor === color
                        ? "border-[#B0F847]   text-black"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full flex gap-3 mb-6">
              <div className=" text-gray-600 font-semibold w-[110px] h-10 flex items-center ">
                Phân loại
              </div>
              <div className="flex-1 grid-flow-col space-x-2.5">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`px-2 py-2  border-2 rounded-lg text-sm cursor-pointer font-medium mb-4 ${
                      selectedSize.id === size.id
                        ? "border-[#B0F847]   text-black"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex gap-2 items-center pr-1">
                      <Image
                        src={size.image}
                        alt={`Product Images`}
                        width={50}
                        height={50}
                        className="aspect-square rounded-md object-cover"
                      />
                      {size.size}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex gap-3 mb-6">
            <div className=" text-gray-600 font-semibold w-[110px] h-10 flex items-center ">
              Số lượng
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 min-w-[60px] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-600">Còn lại 99 sản phẩm</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-10">
            <Button
              size="lg"
              className="flex-1 bg-black hover:bg-black/70 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Thêm vào giỏ hàng
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 cursor-pointer border-black"
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
