"use client";
import Lottie from "lottie-react";
import Loading from "../../../public/animations/Loading1.json";

interface LottieAnimationProps {
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

const LoadingAnimation: React.FC<LottieAnimationProps> = ({
  loop = true,
  autoplay = true,
  className = "w-40",
}) => {
  return (
    <Lottie
      animationData={Loading}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
};

export default LoadingAnimation;
