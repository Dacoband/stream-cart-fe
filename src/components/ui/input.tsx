import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  // If a value prop is provided but is undefined, coerce to "" (except for file inputs)
  const hasValueProp = Object.prototype.hasOwnProperty.call(props, "value");
  type ValueType = string | number | readonly string[] | undefined;
  const providedValue = (props as { value?: ValueType }).value;

  const commonProps = {
    type,
    "data-slot": "input",
    className: cn(
      "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      className
    ),
    ...props,
  } as React.ComponentProps<"input"> & { [key: string]: unknown };

  if (hasValueProp && type !== "file") {
    return <input {...commonProps} value={providedValue ?? ""} />;
  }

  return <input {...commonProps} />;
}

export { Input };
