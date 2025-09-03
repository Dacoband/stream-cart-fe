import { Card } from "@/components/ui/card";
import React from "react";

function page() {
  return (
    <Card className="flex flex-col py-8 px-10 w-full h-full overflow-auto min-h-[calc(100vh-9rem)]">
      <div className="flex justify-between items-center border-b pb-4 mb-5">
        <div>
          <div className="text-xl font-semibold">Lịch sử hoàn tiền:</div>
          <span className="text-muted-foreground text-sm">
            Quản lý các giao dịch hoàn tiền
          </span>
        </div>
      </div>
    </Card>
  );
}

export default page;
