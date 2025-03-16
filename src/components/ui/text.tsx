import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

const textVariants = cva("", {
  variants: {
    variant: {
      xss: "text-[0.625rem]",
      xs: "text-xs",
      sm: "text-sm",
      default: "text-base",
      lg: "text-xl",
      xl: "text-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Text({
  variant,
  className,
  children,
}: VariantProps<typeof textVariants> & { className?: string } & {
  children?: React.ReactNode;
}) {
  return (
    <span className={cn(textVariants({ variant }), className)}>{children}</span>
  );
}
