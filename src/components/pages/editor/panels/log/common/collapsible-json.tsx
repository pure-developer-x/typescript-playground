import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HStack } from "@/components/ui/hstack";
import { PureInspector } from "@/components/ui/pure-inspector";
import { PureTableInspector } from "@/components/ui/pure-table-inspector";
import { ChevronDown, ChevronLeft, Braces } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableIcon } from "@radix-ui/react-icons";

type Props = {
  data: unknown;
  label: string;
  defaultOpen?: boolean;
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
        className="p-0 w-2 h-2 text-muted-foreground"
        variant="ghost"
        onClick={() => onChange(view === "json" ? "table" : "json")}
      >
        {view === "json" ? (
          <TableIcon className="!size-2" />
        ) : (
          <Braces className="!size-2" />
        )}
      </Button>
    </HStack>
  );
}

export function CollapsibleJSON({
  data,
  label = "Headers",
  defaultOpen = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [viewMode, setViewMode] = useState<ViewMode>("json");

  if (!data) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild onClick={(e) => e.preventDefault()}>
        <HStack
          className={`justify-between text-xs py-0.5 px-2 hover:bg-muted/50 transition-colors w-full group cursor-pointer`}
        >
          <button
            className="gap-1 flex-grow text-left"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="text-muted-foreground">
              {label} ({Object.keys(data).length})
            </span>
          </button>
          {isOpen && (
            <HStack className="flex-shrink-0 z-10">
              <ViewToggle view={viewMode} onChange={setViewMode} />
            </HStack>
          )}
          <CollapsibleChevron open={isOpen} />
        </HStack>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pb-1 px-2">
          {viewMode === "json" ? (
            <PureInspector data={data} />
          ) : (
            <PureTableInspector data={data} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
