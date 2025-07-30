import React from "react";
import HeaderNewShop from "../components/HeaderNewShop";
import { Shield, TrendingUp, Zap } from "lucide-react";

export default async function LayoutRegisterShop({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="fixed top-0 w-full z-50 h-[8vh]">
        <HeaderNewShop />
      </div>
      <div className="w-[60%] mx-auto pt-[9vh] ">
        <div className="text-center mb-5">
          <div className="inline-flex items-center space-x-2 mb-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Đăng ký bán hàng
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Tham gia StreamCart và tiếp cận hàng triệu khách hàng trên toàn quốc
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#B0F847" }}
              >
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Tăng doanh số</h3>
                <p className="text-sm text-gray-600">
                  Tiếp cận 10M+ khách hàng
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#B0F847" }}
              >
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Dễ dàng quản lý</h3>
                <p className="text-sm text-gray-600">
                  Công cụ bán hàng hiện đại
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#B0F847" }}
              >
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Hỗ trợ 24/7</h3>
                <p className="text-sm text-gray-600">
                  Đội ngũ chăm sóc tận tình
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="pb-10">{children}</div>
      </div>
    </div>
  );
}
