// src/components/ui/date-picker.tsx
import * as React from 'react'

export function DatePicker({
  date,
  onChange,
}: {
  date: Date | null
  onChange: (d: Date | null) => void
}) {
  return (
    <input
      type="date"
      className="border rounded px-2 py-1 text-sm"
      value={date ? date.toISOString().split('T')[0] : ''}
      onChange={(e) =>
        onChange(e.target.value ? new Date(e.target.value) : null)
      }
    />
  )
}
