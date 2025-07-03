"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import FromAddress from "./components/FromAddress";
function Page() {
  return (
    <Card>
      <CardTitle className="text-2xl font-bold text-center text-gray-900">
        Địa chỉ cửa hàng
      </CardTitle>
      <CardContent>
        <FromAddress />
      </CardContent>
    </Card>
  );
}

export default Page;
