"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export type BaseRow = {
  id: string;
  shopId: string;
  shopName?: string;
  ownerName?: string;
  type: number | string;
  amount: number;
  status: string;
  createdAt: string;
  processedAt?: string | null;
  transactionId?: string | null;
  bankName?: string;
  bankNumber?: string;
};

type Props<T extends BaseRow> = {
  rows: T[];
  loading: boolean;
  showConfirm: boolean;
  // ⬇️ đổi: trả về cả row để lấy amount / shopId
  onConfirm: (row: T) => void | Promise<void>;
  onDetails: (tx: T) => void | Promise<void>;
  renderType: (t: T["type"]) => React.ReactNode;
  renderStatus: (s: T["status"]) => React.ReactNode;
  renderDate: (
    createdAt: string,
    processedAt?: string | null
  ) => React.ReactNode;
  renderAmount: (t: T["type"], n: number) => React.ReactNode;
};

export default function AdminTxTable<T extends BaseRow>({
  rows,
  loading,
  showConfirm,
  onConfirm,
  onDetails,
  renderType,
  renderStatus,
  renderDate,
  renderAmount,
}: Props<T>) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <Table>
        {/* Order: Shop, Loại, Số tiền, Trạng thái, Ngân hàng, Mã GD, Thời gian, Hành động */}
        <TableHeader className="bg-[#B0F847]/50">
          <TableRow>
            <TableHead className="min-w-[260px] font-medium pl-6 py-3 text-left">
              Shop
            </TableHead>
            <TableHead className="w-[140px] font-medium px-4 py-3 text-left">
              Loại
            </TableHead>
            <TableHead className="text-right w-[140px] font-medium px-4 py-3">
              Số tiền
            </TableHead>
            <TableHead className="w-[140px] font-medium px-4 py-3 text-left">
              Trạng thái
            </TableHead>
            <TableHead className="min-w-[220px] font-medium px-4 py-3 text-left">
              Ngân hàng
            </TableHead>
            <TableHead className="w-[200px] font-medium px-4 py-3 truncate text-left">
              Mã GD
            </TableHead>
            <TableHead className="w-[180px] font-medium px-4 py-3 text-left">
              Thời gian
            </TableHead>
            <TableHead className="text-right w-[120px] font-medium pr-6 py-3">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="py-6 text-center">
                Đang tải...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-6 text-center">
                Không có giao dịch
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => {
              const st = String(r.status).toUpperCase();
              return (
                <TableRow key={r.id} className="align-middle">
                  {/* Shop */}
                  <TableCell className="pl-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium truncate">
                        {r.shopName ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {r.ownerName ?? ""}
                      </span>
                    </div>
                  </TableCell>

                  {/* Loại */}
                  <TableCell className="px-4 py-3">
                    {renderType(r.type)}
                  </TableCell>

                  {/* Số tiền */}
                  <TableCell className="text-right px-4 py-3">
                    {renderAmount(r.type, r.amount)}
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell className="px-4 py-3">
                    {renderStatus(r.status)}
                  </TableCell>

                  {/* Ngân hàng */}
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="truncate">{r.bankName ?? "—"}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {r.bankNumber ?? "—"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Mã GD */}
                  <TableCell className="px-4 py-3 truncate">
                    {r.transactionId ?? "—"}
                  </TableCell>

                  {/* Thời gian */}
                  <TableCell className="px-4 py-3">
                    {renderDate(r.createdAt, r.processedAt ?? null)}
                  </TableCell>

                  {/* Hành động */}
                  <TableCell className="text-right pr-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {showConfirm && (st === "PENDING" || st === "RETRY") && (
                        <Button size="sm" onClick={() => onConfirm(r)}>
                          Xác nhận
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Xem chi tiết"
                        onClick={() => onDetails(r)}
                        className="p-2 w-9 h-9 flex items-center justify-center"
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
