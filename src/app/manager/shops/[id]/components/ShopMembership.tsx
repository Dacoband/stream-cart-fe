"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle, Clock, XCircle, CalendarClock, Eye } from "lucide-react";
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

type Membership = {
  membershipId: string;
  name: string;
  description?: string;
  price: number;
  startDate: string;
  endDate: string;
  duration?: string;
  maxProduct?: number;
  maxLivestream?: number;
  commission?: number;
  createdAt?: string;
  updatedAt?: string;
};

const getStatusInfo = (end: string) => {
  const now = new Date();
  const diff =
    (new Date(end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0)
    return {
      label: "Đã hết hạn",
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      color: "bg-red-100 text-red-600",
    };
  if (diff <= 7)
    return {
      label: "Sắp hết hạn",
      icon: <Clock className="w-5 h-5 text-yellow-500" />,
      color: "bg-yellow-100 text-yellow-600",
    };
  return {
    label: "Đang hoạt động",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    color: "bg-green-100 text-green-600",
  };
};

export const ShopMembership = ({ list }: { list: Membership[] }) => {
  const [selected, setSelected] = useState<Membership | null>(null);
  const [startFilter, setStartFilter] = useState<Date | null>(null);
  const [endFilter, setEndFilter] = useState<Date | null>(null);
  const now = new Date();

  const getStatus = (end: string) => {
    const diff =
      (new Date(end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "Đã hết hạn";
    if (diff <= 7) return "Sắp hết hạn";
    return "Đang hoạt động";
  };

  const current = useMemo(
    () => list.find((m) => new Date(m.endDate) > now),
    [list]
  );

  const filteredList = useMemo(() => {
    return list.filter((m) => {
      const s = new Date(m.startDate);
      if (startFilter && s < startFilter) return false;
      if (endFilter && s > endFilter) return false;
      return true;
    });
  }, [list, startFilter, endFilter]);

  const safeFormat = (dateStr?: string) =>
    dateStr && !isNaN(new Date(dateStr).getTime())
      ? format(new Date(dateStr), "dd/MM/yyyy")
      : "Không xác định";

  return (
    <div className="space-y-6">
      {current && (
        <Card className="p-6 border border-lime-200 bg-lime-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                {current.name}
                {getStatus(current.endDate) === "Sắp hết hạn" && (
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                    Sắp hết hạn
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 mb-1">
                {current.description}
              </p>
              <p className="text-sm text-gray-600">
                {format(new Date(current.startDate), "dd/MM/yyyy", {
                  locale: vi,
                })}{" "}
                →{" "}
                {format(new Date(current.endDate), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </p>
            </div>
            <CalendarClock className="w-5 h-5 text-lime-600" />
          </div>
        </Card>
      )}

      {/* Bộ lọc ngày */}

      <Card className="p-6">
        <div className="flex items-end  gap-4">
          <div>
            <label className="text-sm mb-1 font-medium block">Từ ngày</label>
            <DatePicker date={startFilter} onChange={setStartFilter} />
          </div>
          <div>
            <label className="text-sm mb-1 font-medium block">Đến ngày</label>
            <DatePicker date={endFilter} onChange={setEndFilter} />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setStartFilter(null);
              setEndFilter(null);
            }}
          >
            Xoá lọc
          </Button>
        </div>
        <h3 className="text-base font-semibold mb-4">Lịch sử gói thành viên</h3>
        <Table className="border-t border-gray-200">
          <TableHeader className="bg-[#B0F847]/50">
            <TableRow>
              <TableHead className="text-left  font-medium px-5">
                Tên gói
              </TableHead>
              <TableHead className="text-center  font-medium px-5">
                Bắt đầu
              </TableHead>
              <TableHead className="text-center  font-medium px-5">
                Kết thúc
              </TableHead>
              <TableHead className="text-center  font-medium px-5">
                Giá
              </TableHead>
              <TableHead className="text-center  font-medium px-5">
                Trạng thái
              </TableHead>
              <TableHead className="text-right  font-medium px-5">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredList.map((m) => (
              <TableRow
                key={m.membershipId}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <TableCell className="text-left">{m.name}</TableCell>
                <TableCell className="text-center">
                  {format(new Date(m.startDate), "dd/MM/yyyy", { locale: vi })}
                </TableCell>
                <TableCell className="text-center">
                  {format(new Date(m.endDate), "dd/MM/yyyy", { locale: vi })}
                </TableCell>
                <TableCell className="text-center">
                  {m.price.toLocaleString("vi-VN")} đ
                </TableCell>
                <TableCell className="text-center">
                  {(() => {
                    const status = getStatusInfo(m.endDate);
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${status.color}`}
                      >
                        {React.cloneElement(status.icon, {
                          className: "w-3 h-3",
                        })}
                        {status.label}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(m)}
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[70vw] !max-w-none h-[90vh] overflow-y-auto rounded-lg shadow-xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                          <CalendarClock className="w-7 h-7 text-primary" />
                          Chi tiết gói:{" "}
                          <span className="text-primary">{selected?.name}</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 mt-4">
                        {/* Trạng thái */}
                        {selected && (
                          <div
                            className={`flex items-center gap-3 font-semibold px-4 py-3 rounded-lg w-fit text-base shadow-sm border ${
                              getStatusInfo(selected.endDate).color
                            }`}
                          >
                            {getStatusInfo(selected.endDate).icon}
                            <span>{getStatusInfo(selected.endDate).label}</span>
                          </div>
                        )}

                        {/* Thông tin chi tiết: mỗi dòng một thông tin */}
                        <div className=" rounded-lg p-5 border space-y-4">
                          <div>
                            <span className="block text-gray-500 mb-1">
                              Mô tả:
                            </span>
                            <span className="font-medium">
                              {selected?.description || "Không có"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 mb-1">
                              Thời gian:
                            </span>
                            <span className="font-medium">
                              {safeFormat(selected?.startDate)} →{" "}
                              {safeFormat(selected?.endDate)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 mb-1">
                              Giá:
                            </span>
                            <span className="font-semibold text-primary text-lg">
                              {Number(selected?.price).toLocaleString("vi-VN")}{" "}
                              đ
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 mb-1">
                              Tối đa sản phẩm:
                            </span>
                            <span className="font-medium">
                              {selected?.maxProduct}
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 mb-1">
                              Tối đa livestream:
                            </span>
                            <span className="font-medium">
                              {selected?.maxLivestream}
                            </span>
                          </div>
                          <div>
                            <span className="block text-gray-500 mb-1">
                              Chiết khấu:
                            </span>
                            <span className="font-medium">
                              {typeof selected?.commission === "number" &&
                              selected.commission > 0
                                ? `${selected.commission}%`
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
      </Card>
    </div>
  );
};
