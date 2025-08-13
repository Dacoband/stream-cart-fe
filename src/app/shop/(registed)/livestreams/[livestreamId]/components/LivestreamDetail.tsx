"use client";
import { useEffect, useState, useCallback } from "react";
import { getLivestreamById } from "@/services/api/livestream/livestream";
import { Livestream } from "@/types/livestream/livestream";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import TabDescripLive from "./TabDescripLive";
import TabProducts from "./TabProducts";

interface LivestreamDetailProps {
  livestreamId: string;
}

export default function LivestreamDetail({
  livestreamId,
}: LivestreamDetailProps) {
  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLivestreamById(livestreamId);
      setLivestream(res);
    } catch (e) {
      console.error("Load livestream detail error", e);
      setLivestream(null);
    } finally {
      setLoading(false);
    }
  }, [livestreamId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="p-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!livestream) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-500 mb-4">Không tìm thấy livestream.</p>
        <Link href="/shop/livestreams">
          <Button variant="outline" className="cursor-pointer">
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0 z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <h2 className="text-2xl font-bold">{livestream.title}</h2>
        <Link href="/shop/livestreams">
          <Button className="cursor-pointer" variant="outline">
            Quay lại
            <ArrowRight size={18} />
          </Button>
        </Link>
      </div>

      <div className="mx-5 mb-10">
        <Card className="bg-white py-5 px-8 min-h-[78vh]">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-[#B0F847] data-[state=active]:text-black py-3 px-6 rounded-none cursor-pointer"
              >
                Thông tin LiveStream
              </TabsTrigger>
              <TabsTrigger
                value="product"
                className="data-[state=active]:bg-[#B0F847] data-[state=active]:text-black py-3 px-6 rounded-none cursor-pointer"
              >
                Sản phẩm trong Live
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-0">
              <TabDescripLive livestream={livestream} />
            </TabsContent>
            <TabsContent value="product">
              <TabProducts />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
