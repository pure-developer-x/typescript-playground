import { ChevronLeft, ChevronDown } from "lucide-react";

export function CollapsibleChevron({ open }: { open: boolean }) {
  return open ? (
    <ChevronDown className="h-3 w-3 text-muted-foreground" />
  ) : (
    <ChevronLeft className="h-3 w-3 text-muted-foreground" />
  );
}
