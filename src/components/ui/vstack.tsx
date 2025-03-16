import { cn } from "@/lib/utils";
import React from "react";

export const VStack = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<React.HtmlHTMLAttributes<HTMLDivElement>>
>((props, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn("flex flex-col gap-2", props.className)}
    ></div>
  );
});
