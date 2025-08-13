"use client";
import LivestreamDetail from "./components/LivestreamDetail";
import { useParams } from "next/navigation";

export default function LivestreamDetailPage() {
  const { livestreamId } = useParams<{ livestreamId: string }>();
  return (
    <div className="">
      <LivestreamDetail livestreamId={livestreamId} />
    </div>
  );
}
