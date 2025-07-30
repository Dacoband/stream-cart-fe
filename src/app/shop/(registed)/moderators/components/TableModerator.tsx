"use client";

import * as React from "react";
import {
  Calendar,
  Edit,
  MoreVertical,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { formatDateVN } from "@/components/common/FormatDate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Moderator } from "@/types/auth/user";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DialogUpdateModerator from "./DialogUpdateModerator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletesUserById } from "@/services/api/auth/account";
import { toast } from "sonner";

interface TableModeratorProps {
  moderators: Moderator[];
  loading: boolean;
  fetchModerators: () => void;
}

export function TableModerator({
  moderators,
  loading,
  fetchModerators,
}: TableModeratorProps) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedModerator, setSelectedModerator] =
    React.useState<Moderator | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [loadingDelete, setLoadingDelete] = React.useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  );
  const handleOpenDialog = (moderator: Moderator) => {
    setSelectedModerator(moderator);
    setOpenDialog(true);
  };
  const filteredModerators = moderators.filter((moderator) =>
    moderator.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setLoadingDelete(true);
    try {
      await deletesUserById(confirmDeleteId);
      fetchModerators();
      toast.success("Xóa nhân viên thành công!");
    } catch (error) {
      console.error("Fetch Error delete Moderator:", error);
      toast.error("Xóa nhân viên thất bại!");
    } finally {
      setLoadingDelete(false);
      setConfirmDeleteId(null);
    }
  };

  return (
    <Card className="bg-white py-5 px-8 min-h-[75vh]">
      <div className="flex items-center gap-3 py-4">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="text-gray-600" />
            </span>

            <Input
              placeholder="Tìm kiếm tên nhân viên..."
              className="max-w-full pl-12 pr-10 py-5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        <Table>
          <TableHeader className="bg-[#B0F847]/50  ">
            <TableRow className="">
              <TableHead className="font-semibold  pl-6">Nhân viên</TableHead>

              <TableHead className="font-semibold ">Số điện thoại</TableHead>
              <TableHead className="font-semibold ">Email</TableHead>

              <TableHead className="font-semibold ">
                Ngày tạo tài khoản
              </TableHead>
              <TableHead className="font-semibold ">Trạng thái</TableHead>
              <TableHead className="font-semibold text-right w-24 pr-6">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton loading
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : moderators.length === 0 ? (
              // Không có dữ liệu
              <TableRow>
                <TableCell colSpan={5}>
                  <div>
                    <Image
                      src="/assets/emptydata.png"
                      alt="No data"
                      width={180}
                      height={200}
                      className="mt-14 mx-auto"
                    />
                    <div className="text-center mt-4 text-xl text-lime-700/60  font-medium">
                      Hiện chưa có nhân viên nào
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredModerators.map((moderator) => (
                <TableRow key={moderator.id} className="">
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 my-1 ring-2 ring-gray-100">
                        {moderator.avatarURL ? (
                          <AvatarImage
                            src={moderator.avatarURL}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-[#B0F847]/50 to-[#aaf53a] text-black font-semibold uppercase flex items-center w-full h-full justify-center">
                            <UserRound />
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {moderator.fullname}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {moderator.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{moderator.phoneNumber}</TableCell>
                  <TableCell>{moderator.email}</TableCell>

                  <TableCell>
                    <div className="flex gap-2 items-baseline">
                      <Calendar size={15} />{" "}
                      {formatDateVN(moderator.registrationDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium
        ${
          moderator.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            moderator.isActive ? "bg-green-600" : "bg-red-600"
                          }`}
                        />
                        {moderator.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right pr-5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                        >
                          <MoreVertical size={25} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-blue-600"
                          onClick={() => handleOpenDialog(moderator)}
                        >
                          <Edit
                            size={18}
                            className="text-blue-600 flex justify-start"
                          />
                          Cập nhật
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => setConfirmDeleteId(moderator.id)}
                        >
                          <Trash2 size={18} className="text-red-500 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loadingDelete}
              onClick={handleConfirmDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DialogUpdateModerator
        key={selectedModerator?.id || "new"}
        moderator={selectedModerator}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={() => {
          setOpenDialog(false);
          fetchModerators();
        }}
      />
    </Card>
  );
}
