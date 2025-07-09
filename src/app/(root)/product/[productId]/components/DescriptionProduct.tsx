import React from "react";
import { ProductDetail } from "@/types/product/product";
interface DescriptionProductProps {
  product: ProductDetail;
}
function DescriptionProduct({ product }: DescriptionProductProps) {
  return (
    <div className=" mx-auto px-8 ">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-medium text-gray-800 ">
            Chi Tiết Sản Phẩm
          </span>
        </div>
      </div>
      <div className="p-4 space-y-8 mt-2">
        <div>
          <h5 className="text-lg font-bold mb-5 text-gray-900">
            ⭐ Mô tả sản phẩm:
          </h5>
          <span className="text-gray-700">{product.description}</span>
        </div>
        <div>
          <h5 className="text-lg font-bold mb-5 text-gray-900">
            ⭐ Thông số sản phẩm:
          </h5>
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-4">
              {[
                { label: "Danh mục", value: product.categoryName },

                { label: "Chất liệu", value: "số lượng trong kho" },
              ].map((spec, index) => (
                <div
                  key={index}
                  className="flex justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-900 font-medium">
                    {spec.label}:
                  </span>
                  <span className="font-semibold text-gray-700">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                { label: "Khối lượng", value: product.weight },
                { label: "Kích thước", value: product.dimension },
              ].map((spec, index) => (
                <div
                  key={index}
                  className="flex justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-900 font-medium">
                    {spec.label}:
                  </span>
                  <span className="font-semibold text-gray-700">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescriptionProduct;
