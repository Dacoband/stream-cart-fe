import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  isLoading?: boolean
}

const Pagination = ({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: PaginationProps) => {
  const getVisiblePages = () => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, 4, '...', totalPages]
    if (page >= totalPages - 2)
      return [
        1,
        '...',
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
      {/* Page info */}
      <div className="text-sm text-gray-600">
        Trang <strong>{page}</strong> / {totalPages}
      </div>

      {/* Page size */}
      <div className="flex items-center gap-2">
        <span className="text-sm">Hiển thị:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value: string) => onPageSizeChange(Number(value))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm">dòng/trang</span>
      </div>

      {/* Pagination controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          ←
        </Button>

        {visiblePages.map((p, index) =>
          p === '...' ? (
            <span key={index} className="px-2 text-sm text-gray-500">
              ...
            </span>
          ) : (
            <Button
              key={index}
              size="sm"
              variant={page === p ? 'default' : 'outline'}
              onClick={() => onPageChange(Number(p))}
              disabled={isLoading}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          →
        </Button>
      </div>
    </div>
  )
}

export default Pagination
