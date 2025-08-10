import React from 'react';

interface FormatDateProps {
  date: Date | string | number;
  className?: string;
}

export function FormatDate({ date, className }: FormatDateProps) {
  const formatDateVN = (date: Date | string | number): string => {
    if (!date) return "—";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("vi-VN");
  };

  return <span className={className}>{formatDateVN(date)}</span>;
}

// Also export utility function for direct use
export function formatDateVN(date: Date | string | number): string {
  if (!date) return "—";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("vi-VN");
}
