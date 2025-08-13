"use client";
import Lottie from "lottie-react";
import NotFound404 from "../../../public/animations/404.json";

interface LottieAnimationProps {
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

const NotFound: React.FC<LottieAnimationProps> = ({
  loop = true,
  autoplay = true,
  className = "w-[30%]",
}) => {
  return (
    <Lottie
      animationData={NotFound404}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
};

export default NotFound;
