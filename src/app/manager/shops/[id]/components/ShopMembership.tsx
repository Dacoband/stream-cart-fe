"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarClock, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import type { DetailShopMembershipDTO } from "@/types/membership/shopMembership";
const STATUS = {
  Ongoing: "Ongoing", // Đang hoạt động
  Waiting: "Waiting", // Chờ hoạt động
  Cancelled: "Canceled", // Đã hủy
  Overdue: "Overdue", // Hết hạn
} as const;
const VI_LABEL: Record<string, string> = {
  [STATUS.Ongoing]: "Đang hoạt động",
  [STATUS.Waiting]: "Chờ hoạt động",
  [STATUS.Cancelled]: "Đã hủy",
  [STATUS.Overdue]: "Hết hạn",
};
const safeFormat = (d?: Date | string) => {
  if (!d) return "Không xác định";
  const date = d instanceof Date ? d : new Date(d);
  return !isNaN(date.getTime())
    ? format(date, "dd/MM/yyyy", { locale: vi })
    : "Không xác định";
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case STATUS.Ongoing:
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
          {VI_LABEL[status]}
        </Badge>
      );
    case STATUS.Waiting:
      return (
        <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
          {VI_LABEL[status]}
        </Badge>
      );
    case STATUS.Overdue:
      return (
        <Badge className="bg-rose-100 text-rose-800 border border-rose-200">
          {VI_LABEL[status]}
        </Badge>
      );
    case STATUS.Cancelled:
      return (
        <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
          {VI_LABEL[status]}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const ShopMembership = ({
  list,
}: {
  list: DetailShopMembershipDTO[];
}) => {
  // Removed unused 'selected' state
  const [startFilter, setStartFilter] = useState<Date | null>(null);
  const [endFilter, setEndFilter] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Gói hiện tại = gói có endDate > now & status Ongoing
  // const now = new Date()
  // const current = useMemo(
  //   () =>
  //     list.find(
  //       (m) => new Date(m.endDate) > now && m.status === STATUS.Ongoing
  //     ),
  //   [list]
  // )

  // áp dụng filter
  const filteredList = useMemo(() => {
    return list.filter((m) => {
      const s = new Date(m.startDate);
      if (startFilter && s < startFilter) return false;
      if (endFilter && s > endFilter) return false;
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
      return true;
    });
  }, [list, startFilter, endFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Bộ lọc */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm mb-1 font-medium block">Từ ngày</label>
            <DatePicker date={startFilter} onChange={setStartFilter} />
          </div>
          <div>
            <label className="text-sm mb-1 font-medium block">Đến ngày</label>
            <DatePicker date={endFilter} onChange={setEndFilter} />
          </div>
          <div className="">
            <label className="text-sm mb-1 font-medium block">Trạng thái</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {Object.entries(VI_LABEL).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setStartFilter(null);
              setEndFilter(null);
              setStatusFilter("ALL");
            }}
          >
            Xoá lọc
          </Button>
        </div>

        <h3 className="text-base font-semibold mb-4 mt-4">
          Lịch sử gói thành viên
        </h3>

        {filteredList.length === 0 ? (
          <div className="text-sm text-gray-600 px-5 py-4">
            Không có dữ liệu gói thành viên.
          </div>
        ) : (
          <Table className="border-t border-gray-200">
            <TableHeader className="bg-[#B0F847]/50">
              <TableRow>
                <TableHead className="text-left font-medium px-5">
                  Tên gói
                </TableHead>
                <TableHead className="text-center font-medium px-5">
                  Bắt đầu
                </TableHead>
                <TableHead className="text-center font-medium px-5">
                  Kết thúc
                </TableHead>
                <TableHead className="text-center font-medium px-5">
                  Trạng thái
                </TableHead>
                <TableHead className="text-right font-medium px-5">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((m) => (
                <TableRow
                  key={m.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <TableCell className="text-left">
                    {m.name ?? "Gói thành viên"}
                  </TableCell>
                  <TableCell className="text-center">
                    {safeFormat(m.startDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    {safeFormat(m.endDate)}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          // onClick={() => setSelected(m)}
                        >
                          <Eye className="w-4 h-4" />
                          Xem
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[70vw] !max-w-none h-[60vh] overflow-y-auto rounded-lg shadow-xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-1 text-2xl">
                            <CalendarClock className="w-7 h-7 text-primary" />
                            Chi tiết gói:{" "}
                            <span className="text-primary">
                              {m.name ?? "Gói thành viên"}
                            </span>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-1">
                          <div className="">
                            <StatusBadge status={m.status} />
                          </div>
                          <div className="rounded-lg p-5 border space-y-4">
                            <div>
                              <span className="block text-gray-500 mb-1">
                                Thời gian:
                              </span>
                              <span className="font-medium">
                                {safeFormat(m.startDate)} →{" "}
                                {safeFormat(m.endDate)}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-500 mb-1">
                                Tối đa sản phẩm:
                              </span>
                              <span className="font-medium">
                                {m.maxProduct ?? "—"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-500 mb-1">
                                Livestream còn lại:
                              </span>
                              <span className="font-medium">
                                {m.remainingLivestream ?? "—"}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-500 mb-1">
                                Chiết khấu:
                              </span>
                              <span className="font-medium">
                                {typeof m.commission === "number"
                                  ? `${m.commission}%`
                                  : "Không áp dụng"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
