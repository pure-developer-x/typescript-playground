import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HStack } from "@/components/ui/hstack";
import { PureInspector } from "@/components/ui/pure-inspector";
import { PureTableInspector } from "@/components/ui/pure-table-inspector";
import { ChevronDown, ChevronLeft, TableIcon, Braces } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  headers: Record<string, string>;
  label?: string;
  defaultOpen?: boolean;
  className?: string;
  triggerClassName?: string;
};

type ViewMode = "json" | "table";

function CollapsibleChevron({ open }: { open: boolean }) {
  return open ? (
    <ChevronDown className="h-3 w-3 text-muted-foreground" />
  ) : (
    <ChevronLeft className="h-3 w-3 text-muted-foreground" />
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <HStack className="gap-1">
      <Button
        size="sm-icon"
        variant="ghost"
        onClick={() => onChange(view === "json" ? "table" : "json")}
      >
        {view === "json" ? (
          <TableIcon className="h-3 w-3" />
        ) : (
          <Braces className="h-3 w-3" />
        )}
      </Button>
    </HStack>
  );
}

export function CollapsibleHeaders({
  headers,
  label = "Headers",
  defaultOpen = false,
  className = "text-xs",
  triggerClassName = "py-0.5 px-2 hover:bg-muted/50 transition-colors",
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [viewMode, setViewMode] = useState<ViewMode>("json");
  const headerCount = Object.keys(headers).length;
  const entries = Object.entries(headers).map(([key, value]) => ({
    key,
    value,
  }));

  if (headerCount === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="w-full group">
        <HStack className={`justify-between ${triggerClassName}`}>
          <span className="text-muted-foreground">
            {label} ({headerCount})
          </span>
          <CollapsibleChevron open={isOpen} />
        </HStack>
      </CollapsibleTrigger>
      <CollapsibleContent className="relative">
        {isOpen && (
          <HStack className="absolute top-0 right-0 pr-1.5 z-10">
            <ViewToggle view={viewMode} onChange={setViewMode} />
          </HStack>
        )}
        <div className="pb-1 px-2">
          {viewMode === "json" ? (
            <PureInspector data={headers} />
          ) : (
            <PureTableInspector data={entries} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
