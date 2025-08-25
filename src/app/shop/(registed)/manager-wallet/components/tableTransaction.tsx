"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatFullDateTimeVN } from "@/components/common/formatFullDateTimeVN";

type TxStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface TransactionItem {
  id: string; // e.g. WD-001
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  amount: number; // yêu cầu rút
  fee?: number; // phí
  netAmount?: number; // thực nhận
  status: TxStatus;
  createdAt: string | Date;
  processedAt?: string | Date | null;
  transactionId?: string | null; // Mã GD hiển thị khi Hoàn thành
}

function formatVND(n?: number) {
  return typeof n === "number"
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "—";
}

const statusBadge = (status: TxStatus) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Hoàn thành
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          Chờ xử lý
        </Badge>
      );
    default:
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          Thất bại
        </Badge>
      );
  }
};

const fallbackRows: TransactionItem[] = [
  {
    id: "WD-001",
    bankName: "Vietcombank",
    bankAccountNumber: "1234567890",
    bankAccountName: "NGUYEN VAN A",
    amount: 1_000_000,
    fee: 10_000,
    netAmount: 990_000,
    status: "PENDING",
    createdAt: "2025-01-26T15:00:00Z",
    processedAt: null,
    transactionId: null,
  },
  {
    id: "WD-002",
    bankName: "Vietcombank",
    bankAccountNumber: "1234567890",
    bankAccountName: "NGUYEN VAN A",
    amount: 500_000,
    fee: 5_000,
    netAmount: 495_000,
    status: "COMPLETED",
    createdAt: "2025-01-25T21:30:00Z",
    processedAt: "2025-01-25T23:00:00Z",
    transactionId: "TX-20250125-0002",
  },
];

interface Props {
  rows?: TransactionItem[];
}

export default function TableTransaction({ rows }: Props) {
  const data = rows && rows.length ? rows : fallbackRows;

  return (
    <Table>
      <TableHeader className="bg-[#B0F847]/50">
        <TableRow>
          <TableHead className="font-semibold pl-6">Loại</TableHead>
          <TableHead className="font-semibold">Tài khoản nhận</TableHead>
          <TableHead className="font-semibold text-right">Số tiền</TableHead>
          <TableHead className="font-semibold">Trạng thái</TableHead>
          <TableHead className="font-semibold">Thời gian</TableHead>
          <TableHead className="font-semibold">Mã GD</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((it) => (
          <TableRow key={it.id}>
            <TableCell className="font-medium">Yêu cầu rút tiền</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="text-foreground flex gap-4">
                  <span>{it.bankName ?? "—"}</span> -{" "}
                  <span> {it.bankAccountNumber}</span>
                </span>
              </div>
            </TableCell>
            <TableCell className="">
              <div className="flex flex-col items-end">
                <span className="text-foreground font-medium">
                  {formatVND(it.amount)}
                </span>
              </div>
            </TableCell>
            <TableCell>{statusBadge(it.status)}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{formatFullDateTimeVN(it.createdAt)}</span>
                {it.processedAt && (
                  <span className="text-muted-foreground text-xs">
                    Xử lý: {formatFullDateTimeVN(it.processedAt)}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {it.status === "COMPLETED" && it.transactionId ? (
                <span className="text-foreground font-medium">
                  {it.transactionId}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
