"use client";
import { Button } from "@/components/ui/button";
import requireRole from "@/lib/requireRole";
import { Edit } from "lucide-react";
import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
function Profile() {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between border-b pb-4">
        <div>
          <div className="text-2xl font-semibold mb-1 ">Hồ sơ của tôi:</div>
          <span className="text-muted-foreground ">
            Quản lý thông tin người dùng và điểm thưởng
          </span>
        </div>
        <Button className="bg-white text-black border-2 cursor-pointer hover:bg-gray-100">
          <Edit /> Chỉnh sửa
        </Button>
      </div>
      <div className="flex items-center pt-10 px-10 h-fit">
        <div className="w-[30%] flex flex-col items-center px-5 h-full">
          <Avatar className="w-60 h-60">
            <AvatarImage src="https://i.pinimg.com/736x/8b/8a/ed/8b8aed24d96cefbf7b339b3e5e23bf7e.jpg" />
          </Avatar>
          <span className="bg-purple-200 text-purple-700 px-4 py-1.5 rounded-full   font-medium w-full text-center mt-8 mx-5">
            Điểm thưởng: 0
          </span>
        </div>
        <div className="flex-1 pl-10 border-l ">
          <div className="text-xl font-semibold text-muted-foreground mb-8">
            Thông tin cá nhân
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" value="ok" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tên người dùng</Label>
              <Input id="email" value="ok" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" value="ok" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinDate">Email</Label>
              <Input id="joinDate" value="ok" readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default requireRole(Profile, ["user"]);
