'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

type Props = {
  shops: { id: string; shopName: string }[]
  filters: {
    shopId: string | null
    startDate: Date | null
    endDate: Date | null
    statuses: number[] | null
  }
  onChange: (filters: Props['filters']) => void
  onReset: () => void
}

export const AllOrderFilters: React.FC<Props> = ({
  shops,
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-lg shadow">
      {/* Shop filter */}
      <div>
        <Label className="pb-2">Cửa hàng</Label>
        <Select
          value={filters.shopId ?? 'ALL'}
          onValueChange={(v) =>
            onChange({ ...filters, shopId: v === 'ALL' ? null : v })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn cửa hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            {shops.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.shopName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Start date */}
      <div>
        <Label className="pb-2">Từ ngày</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate
                ? format(filters.startDate, 'dd/MM/yyyy', { locale: vi })
                : 'Chọn ngày'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={filters.startDate ?? undefined}
              onSelect={(d) => onChange({ ...filters, startDate: d ?? null })}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End date */}
      <div>
        <Label className="pb-2">Đến ngày</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.endDate
                ? format(filters.endDate, 'dd/MM/yyyy', { locale: vi })
                : 'Chọn ngày'}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={filters.endDate ?? undefined}
              onSelect={(d) => onChange({ ...filters, endDate: d ?? null })}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Reset */}
      <div className="flex items-end ">
        <Button variant="outline" onClick={onReset}>
          Xoá lọc
        </Button>
      </div>
    </div>
  )
}
