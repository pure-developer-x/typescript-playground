import { cn } from "@/lib/utils";
import React from "react";

export const HStack = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    {...props}
    className={cn("flex gap-2  items-center", className)}
  ></div>
));
