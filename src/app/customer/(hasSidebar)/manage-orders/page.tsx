"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { withRoleProtection } from "@/lib/requireRole";
function ManagerOrders() {
  return (
    <div className="w-full h-full ">
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="0">Chờ xác nhận</TabsTrigger>
          <TabsTrigger value="1">Đóng gói</TabsTrigger>
          <TabsTrigger value="2">Chờ giao hàng</TabsTrigger>
          <TabsTrigger value="3">Hoàn thành</TabsTrigger>
          <TabsTrigger value="4">Đã hủy</TabsTrigger>
          <TabsTrigger value="5">Trả hàng/ Hoàn tiền</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
}

export default withRoleProtection(ManagerOrders, [1]);
