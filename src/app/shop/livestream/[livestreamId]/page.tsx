import React from "react";
import ScreenLivestream from "../components/ScreenLivestream";
interface PageProps {
  params: {
    livestreamId: string;
  };
}
function SellerLiveStream({ params }: PageProps) {
  const { livestreamId } = params;
  return (
    <div>
      <div></div>
      <ScreenLivestream livestreamId={livestreamId} />
    </div>
  );
}

export default SellerLiveStream;
