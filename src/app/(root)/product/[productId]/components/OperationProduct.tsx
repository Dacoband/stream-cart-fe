"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CircleAlert,
  Eye,
  ImageIcon,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { createCart } from "@/services/api/cart/cart";
import { ProductDetail, Variant } from "@/types/product/product";
import PriceTag from "@/components/common/PriceTag";
import { getImageProductByProductId } from "@/services/api/product/ProductImage";
import { ProductImage } from "@/types/product/productImage";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import AutoCloseDialog from "./DialogSuccsess";

interface OperationProductPops {
  product: ProductDetail;
}

export default function OperationProduct({ product }: OperationProductPops) {
  const { refreshCart } = useCart();
  const [imageProduct, setImageProduct] = useState<ProductImage[]>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const router = useRouter();
  const [variantError, setVariantError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await getImageProductByProductId(product.productId);
        if (res && Array.isArray(res)) {
          const sorted = res.sort((a, b) => a.displayOrder - b.displayOrder);
          setImageProduct(sorted);
        }
      } catch (err) {
        console.error("Lỗi lấy ảnh sản phẩm:", err);
      }
    };
    fetchImages();
  }, [product.productId]);

  const handleSelectAttribute = (attributeName: string, value: string) => {
    const updatedAttributes = {
      ...selectedAttributes,
      [attributeName]: value,
    };
    setSelectedAttributes(updatedAttributes);

    const requiredCount = product.attributes.length;
    const selectedCount = Object.keys(updatedAttributes).length;

    if (selectedCount === requiredCount) {
      const matchedVariant = product.variants.find((variant) =>
        Object.entries(updatedAttributes).every(
          ([key, val]) => variant.attributeValues[key] === val
        )
      );
      setSelectedVariant(matchedVariant || null);
    } else {
      setSelectedVariant(null);
    }

    setVariantError(null);
  };
  const handleClickBuy = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      const currentPath = `/product/${product.productId}`;
      toast.error("Vui lòng đăng nhập.");
      router.push(
        `/authentication/login?redirect=${encodeURIComponent(currentPath)}`
      );
      return;
    }

    const hasVariants = product.variants && product.variants.length > 0;

    if (hasVariants && !selectedVariant) {
      setVariantError("Vui lòng chọn phiên bản sản phẩm.");
      return;
    }

    try {
      setVariantError(null);
      await createCart({
        productId: product.productId,
        variantId: hasVariants ? selectedVariant?.variantId ?? "" : "",
        quantity: quantity,
      });
      await refreshCart();

      setShowDialog(true);
    } catch (error) {
      toast.error("Không thể thêm vào giỏ hàng!");
      console.error(error);
    }
  };

  return (
    <div className=" mx-auto px-8  pb-8">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Product Images */}
        <div className="space-y-4 w-2/5">
          <div className="aspect-square w-full mb-5 bg-white overflow-hidden border mx-auto">
            {imageProduct && imageProduct.length > 0 ? (
              <Image
                src={
                  imageProduct[selectedImage]?.imageUrl || "/placeholder.svg"
                }
                alt={imageProduct[selectedImage]?.altText || "Product Image"}
                width={1000}
                height={1000}
                quality={100}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="bg-gray-200 w-full flex items-center justify-center h-full text-gray-400">
                <ImageIcon size={120} />
              </div>
            )}
          </div>
          {imageProduct && imageProduct.length > 1 && (
            <div className="">
              <Carousel
                className="w-full"
                opts={{ align: "start", slidesToScroll: 1 }}
              >
                <CarouselContent className="flex">
                  {imageProduct.map((image, index) => (
                    <CarouselItem key={image.id} className="basis-1/4">
                      <button
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square w-full cursor-pointer overflow-hidden border-2 transition relative ${
                          selectedImage === index ? " z-10" : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={image.imageUrl || "/placeholder.svg"}
                          alt={image.altText || `Product Image ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                        />
                        {selectedImage === index && (
                          <div className="absolute inset-0 bg-black/40 pointer-events-none rounded text-white flex justify-center items-center">
                            <Eye size={30} />
                          </div>
                        )}
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 z-10 bg-black/50 text-white w-8" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white w-8" />
              </Carousel>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6 w-3/5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              {product.productName}
            </h1>
            <div className="flex items-center space-x-4 mb-4 ">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 pr-5 border-r">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(4.2)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">4.2</span>
                </div>
                {/* <span className="text-gray-600">
                  ({product.reviews.toLocaleString()} đánh giá)
                </span> */}
                <span className="text-gray-600">
                  Đã bán {product.quantitySold}
                </span>
              </div>
            </div>
          </div>
          {/* <div className="flex justify-between bg-gradient-to-r  from-[#B0F847]/10 to-green-50 rounded-2xl p-6 border border-[#B0F847]/20"> */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 py-6 pl-6 pr-16 rounded-2xl border border-red-200 ">
            <div className="flex justify-between">
              <div className="flex items-center space-x-4 mb-2">
                {selectedVariant ? (
                  <span className="text-4xl font-bold text-red-600">
                    <PriceTag
                      value={
                        selectedVariant.flashSalePrice &&
                        selectedVariant.flashSalePrice > 0
                          ? selectedVariant.flashSalePrice
                          : selectedVariant.price
                      }
                    />
                  </span>
                ) : (
                  <span className="text-4xl font-bold text-red-600">
                    <PriceTag value={product.finalPrice} />
                  </span>
                )}

                {product.discountPrice > 0 && (
                  <span className="text-xl text-gray-500 line-through">
                    <PriceTag
                      value={
                        selectedVariant
                          ? selectedVariant.price
                          : product.basePrice
                      }
                    />
                  </span>
                )}
              </div>
              {product.discountPrice > 0 && (
                <Badge className="bg-red-500 text-white px-4 rounded-full text-sm font-bold">
                  Giảm đến {product.discountPrice}%
                </Badge>
              )}
            </div>
            {product.discountPrice > 0 && (
              <p className="text-sm text-red-600 font-medium mt-3">
                🔥 Ưu đãi hấp dẫn có thời hạn
              </p>
            )}
          </div>
          {product.attributes?.length > 0 && (
            <div className="space-y-5">
              {product.attributes.map((attr, index) => (
                <div key={index} className="w-full flex gap-3 ">
                  <div className="text-gray-600 font-semibold w-[80px] h-10 flex items-center">
                    {attr.attributeName}
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2.5">
                    {attr.valueImagePairs.map((pair, id) => {
                      const isSelected =
                        selectedAttributes[attr.attributeName] === pair.value;
                      return (
                        <button
                          key={id}
                          onClick={() =>
                            handleSelectAttribute(
                              attr.attributeName,
                              pair.value
                            )
                          }
                          className={`px-4 py-2 border-2 rounded-lg cursor-pointer font-medium mb-2 ${
                            isSelected
                              ? "border-[#B0F847] bg-[#B0F847]/8 text-[#70a301]"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <div className="flex gap-2 items-center pr-1">
                            {pair.imageUrl && (
                              <Image
                                src={pair.imageUrl}
                                alt={`Product Images`}
                                width={50}
                                height={50}
                                className="aspect-square rounded-md object-cover"
                              />
                            )}
                            {pair.value}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="min-h-2 mb-0">
            {variantError && (
              <div className="text-blue-600 flex items-center mb-5 gap-2 px-5 text-sm font-medium  bg-blue-50 h-8 border-blue-200 border">
                <CircleAlert size={20} /> {variantError}
              </div>
            )}
          </div>

          <div className="w-full flex gap-3 mb-6">
            <div className=" text-gray-600 font-semibold w-[80px] h-10 flex items-center ">
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
              <span className="text-sm text-gray-600">
                Còn lại{" "}
                {selectedVariant
                  ? selectedVariant.stock
                  : product.stockQuantity}{" "}
                sản phẩm
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-10">
            <Button
              onClick={handleClickBuy}
              size="lg"
              className="flex-1 bg-[#B0F847] hover:bg-[#B0F847]/80 font-semibold text-black cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Thêm vào giỏ hàng
            </Button>
            <Button
              onClick={handleClickBuy}
              size="lg"
              variant="outline"
              className="flex-1 cursor-pointer  bg-black font-medium hover:bg-black/80 text-white hover:text-white"
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
      <AutoCloseDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </div>
  );
}
