import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function LoadingCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-48 " />
      <div className="space-y-2">
        <Skeleton className="h-4 " />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
    </div>
  );
}

export default LoadingCard;
