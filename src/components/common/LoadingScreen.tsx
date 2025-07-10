"use client";

import React from "react";
import LoadingAnimation from "@/components/common/Loading";

interface LoadingPageProps {
  progress?: number;
  accentColor?: string;
  progressBg?: string;
  textColor?: string;
}

const LoadingScreen: React.FC<LoadingPageProps> = ({}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full space-y-4 h-[calc(100vh-80px)]">
      {/* Lottie Animation */}
      <div className="w-80 h-80 rounded-full flex justify-center items-center relative">
        {/* Vòng viền loading xoay */}
        <div className="absolute inset-0 rounded-full border-8 border-t-black border-b-transparent border-l-transparent border-r-transparent animate-spin" />

        {/* Lottie hoặc icon loading */}
        <LoadingAnimation />
      </div>

      <div className="flex gap-4 justify-end items-end">
        <h4 className="font-bold text-2xl leading-none">Đang tải thông tin</h4>

        {/* Bounce dots */}
        <div className="flex space-x-2 mt-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-black rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
