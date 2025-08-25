"use client";

import * as React from "react";
import {
  Calendar,
  Edit,
  MoreVertical,
  Search,
  Trash2,
  UserRound,
  Filter,
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
import { User } from "@/types/auth/user";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getUsersByRole, deletesUserById } from "@/services/api/auth/account";
import { toast } from "sonner";

// Role mapping theo backend enum
const ROLE_LABELS = {
  1: "Customer",        // Customer
  2: "Seller",          // Seller  
  3: "Moderator",       // Moderator
  5: "OperationManager" // OperationManager
} as const;

const ROLE_COLORS = {
  1: "bg-blue-100 text-blue-700",     // Customer
  2: "bg-orange-100 text-orange-700", // Seller
  3: "bg-green-100 text-green-700",   // Moderator
  5: "bg-purple-100 text-purple-700"  // OperationManager
} as const;

export default function TableAccount() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("all");
  const [loadingDelete, setLoadingDelete] = React.useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = React.useState<User | null>(null);

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      let userData: User[] = [];
      
      if (selectedRole === "all") {
        // Chỉ lấy users từ role 1, 2, 3, 5 (Customer, Seller, Moderator, OperationManager)
        const allowedRoles = [1, 2, 3, 5];
        for (const role of allowedRoles) {
          try {
            const users = await getUsersByRole(role);
            userData.push(...users);
          } catch (error) {
            console.error(`Error fetching users for role ${role}:`, error);
          }
        }
      } else {
        userData = await getUsersByRole(parseInt(selectedRole));
      }
      
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete user
  const handleConfirmDelete = async () => {
    if (!confirmDeleteUser) return;
    setLoadingDelete(true);
    try {
      await deletesUserById(confirmDeleteUser.id);
      fetchUsers();
      toast.success("Xóa tài khoản thành công!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Xóa tài khoản thất bại!");
    } finally {
      setLoadingDelete(false);
      setConfirmDeleteUser(null);
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
              placeholder="Tìm kiếm tên, username, email..."
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
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-600" size={20} />
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Lọc theo role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="1">Customer</SelectItem>
              <SelectItem value="2">Seller</SelectItem>
              <SelectItem value="3">Moderator</SelectItem>
              <SelectItem value="5">OperationManager</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full">
        <Table>
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="font-semibold pl-6">Tài khoản</TableHead>
              <TableHead className="font-semibold">Số điện thoại</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Ngày tạo</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold text-right w-24 pr-6">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton loading
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              // Không có dữ liệu
              <TableRow>
                <TableCell colSpan={7}>
                  <div>
                    <Image
                      src="/assets/emptydata.png"
                      alt="No data"
                      width={180}
                      height={200}
                      className="mt-14 mx-auto"
                    />
                    <div className="text-center mt-4 text-xl text-lime-700/60 font-medium">
                      {searchTerm ? "Không tìm thấy tài khoản nào" : "Hiện chưa có tài khoản nào"}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 my-1 ring-2 ring-gray-100">
                        {user.avatarURL ? (
                          <AvatarImage
                            src={user.avatarURL}
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
                          {user.fullname || "Chưa cập nhật"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{user.phoneNumber || "Chưa cập nhật"}</TableCell>
                  <TableCell>{user.email || "Chưa cập nhật"}</TableCell>
                  
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                      ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || "bg-gray-100 text-gray-700"
                    }`}>
                      {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || `Role ${user.role}`}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2 items-baseline">
                      <Calendar size={15} />
                      {user.registrationDate ? formatDateVN(user.registrationDate) : formatDateVN(user.createdAt)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          user.isActive ? "bg-green-600" : "bg-red-600"
                        }`} />
                        {user.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                      {user.isVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          ✓ Đã xác minh
                        </span>
                      )}
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

                        <DropdownMenuItem className="text-blue-600">
                          <Edit size={18} className="text-blue-600 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={() => setConfirmDeleteUser(user)}
                        >
                          <Trash2 size={18} className="text-red-500 mr-2" />
                          Xóa tài khoản
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

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog
        open={!!confirmDeleteUser}
        onOpenChange={(open) => !open && setConfirmDeleteUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản{" "}
              <strong>{confirmDeleteUser?.fullname || confirmDeleteUser?.username}</strong> không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={loadingDelete}
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {loadingDelete ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
