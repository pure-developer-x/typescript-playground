import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { atom, useAtomValue } from "jotai";
import { HStack } from "@/components/ui/hstack";
import { LoadingEsmMessage } from "@/lib/logs";
import { esmStatusAtom } from "@/hooks/useEvalContext";

const StatusIcon = ({ status }: { status: LoadingEsmMessage["status"] }) => {
  switch (status) {
    case "loading":
      return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
    case "loaded":
      return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
    case "error":
      return <XCircle className="h-3 w-3 text-red-500" />;
  }
};

const moduleEntriesAtom = atom((get) => {
  const statusByModule = get(esmStatusAtom);
  return Object.entries(statusByModule).map(([module, data]) => ({
    module,
    status: data.status,
  }));
});

export function EsmLoadingStatus() {
  const moduleEntries = useAtomValue(moduleEntriesAtom);

  if (!moduleEntries.length) return null;

  const hasLoading = moduleEntries.some(({ status }) => status === "loading");
  const hasError = moduleEntries.some(({ status }) => status === "error");
  const status = hasLoading ? "loading" : hasError ? "error" : "loaded";

  return (
    <Tooltip>
      <TooltipTrigger>
        <HStack className="text-xs flex items-center justify-center rounded-md gap-2">
          <StatusIcon status={status} />
          ESM Status
        </HStack>
      </TooltipTrigger>
      <TooltipContent className="w-fit max-w-[300px]">
        <div className="flex flex-col gap-2">
          <div className="border-b border-border pb-1">
            <span className="text-xs font-medium">ESM Module Status</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {moduleEntries.map(({ module, status }) => (
              <div key={module} className="flex items-center gap-2 text-xs">
                <StatusIcon status={status} />
                <span className="truncate font-mono text-muted-foreground">
                  {module}
                </span>
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
