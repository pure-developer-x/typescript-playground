import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HStack } from "@/components/ui/hstack";
import { PureInspector } from "@/components/ui/pure-inspector";
import { ChevronDown, ChevronLeft } from "lucide-react";

type Props = {
  body: unknown;
  label?: string;
  defaultOpen?: boolean;
  className?: string;
  triggerClassName?: string;
  type?: string;
};

function CollapsibleChevron({ open }: { open: boolean }) {
  return open ? (
    <ChevronDown className="h-3 w-3 text-muted-foreground" />
  ) : (
    <ChevronLeft className="h-3 w-3 text-muted-foreground" />
  );
}

export function CollapsibleBody({
  body,
  label = "Body",
  defaultOpen = false,
  className = "text-xs",
  triggerClassName = "py-0.5 px-2 hover:bg-muted/50 transition-colors",
  type,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (body === undefined || body === null || type === "none") {
    return (
      <div className="px-2">
        <span className="text-xs text-muted-foreground">
          No {label.toLowerCase()}
        </span>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="w-full group">
        <HStack className={`justify-between ${triggerClassName}`}>
          <span className="text-muted-foreground">{label}</span>
          <CollapsibleChevron open={isOpen} />
        </HStack>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pb-1 px-2">
          {type === "json" || !type ? (
            <PureInspector data={body} />
          ) : (
            <span className="text-xs text-muted-foreground">
              {type.charAt(0).toUpperCase() + type.slice(1)} response
            </span>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
