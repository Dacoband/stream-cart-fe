import React, { useEffect, useState } from "react";
import { getListBank } from "@/services/api/listbank/listbank";
import { Bank } from "@/types/listbank/listbank";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";

// Định nghĩa kiểu form chính xác
interface FormValues {
  shopName: string;
  description: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  bankName: string;
  bankNumber: string;
  tax: string;
}

interface SelectBankProps {
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
}

function SelectBank({ setValue, watch }: SelectBankProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [search, setSearch] = useState("");

  const selectedBank = watch("bankName");

  useEffect(() => {
    const fetchBanks = async () => {
      const data = await getListBank();
      setBanks(data);
    };
    fetchBanks();
  }, []);

  const filteredBanks = banks.filter((bank) => {
    const keyword = search.toLowerCase();
    return (
      bank.name.toLowerCase().includes(keyword) ||
      bank.shortName.toLowerCase().includes(keyword)
    );
  });

  const selectedBankData = banks.find(
    (bank) => bank.id.toString() === selectedBank
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="bankName" className="text-black text-sm font-medium">
        Chọn ngân hàng *
      </Label>

      <Select
        value={selectedBank || ""}
        onValueChange={(value) => setValue("bankName", value)}
      >
        <SelectTrigger className="w-full h-16">
          {selectedBankData ? (
            <div className="flex items-center gap-3">
              <Image
                src={selectedBankData.logo}
                alt={selectedBankData.name}
                width={80}
                height={45}
                className="object-contain"
              />
              <span>
                {selectedBankData.shortName} - {selectedBankData.name}
              </span>
            </div>
          ) : (
            <SelectValue placeholder="Chọn ngân hàng" />
          )}
        </SelectTrigger>

        <SelectContent className="max-h-96 p-0">
          {/* Thanh tìm kiếm */}
          <div className="p-2 border-b">
            <Input
              placeholder="Tìm kiếm ngân hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Danh sách ngân hàng */}
          <div className="max-h-80 overflow-y-auto">
            {filteredBanks.length > 0 ? (
              filteredBanks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id.toString()}>
                  <div className="flex items-center gap-3 h-fit">
                    {bank.logo && (
                      <Image
                        src={bank.logo}
                        alt={bank.name}
                        width={80}
                        height={45}
                        className="object-contain"
                      />
                    )}
                    <span>
                      {bank.shortName} - {bank.name}
                    </span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500">
                Không tìm thấy ngân hàng
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}

export default SelectBank;
