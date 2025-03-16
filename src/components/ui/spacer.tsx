import { cn } from "@/lib/utils";

export function Spacer({ className }: { className?: string }) {
  return <div className={cn("flex-grow", className)} />;
}
