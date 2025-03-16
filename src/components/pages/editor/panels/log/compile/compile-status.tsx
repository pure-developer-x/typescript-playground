import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAtomValue } from "jotai";
import { HStack } from "@/components/ui/hstack";
import { Ansi } from "@/components/ui/ansi";
import { CompileMessage } from "@/lib/logs";
import { compileStatusAtom } from "@/hooks/useEvalContext";

const StatusIcon = ({ status }: { status: CompileMessage["status"] }) => {
  switch (status) {
    case "compiling":
      return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
    case "success":
      return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    case "error":
      return <XCircle className="h-3 w-3 text-red-500" />;
  }
};

export function CompileStatus() {
  const compileStatus = useAtomValue(compileStatusAtom);

  if (!compileStatus || compileStatus.status === "success") return null;

  return (
    <Tooltip>
      <TooltipTrigger>
        <HStack className="text-xs flex items-center justify-center rounded-md">
          Compile: <StatusIcon status={compileStatus.status} />
        </HStack>
      </TooltipTrigger>
      <TooltipContent
        className="w-fit max-w-[600px] max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-background"
        side="left"
      >
        {compileStatus.status === "error" && (
          <div className="flex flex-col gap-2">
            <div className="border-b border-border pb-1 sticky top-0 bg-background">
              <span className="text-xs font-medium">Compilation Message</span>
            </div>
            <CompileError error={compileStatus.error} />
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function CompileError({ error }: { error: CompileMessage["error"] }) {
  if (!error) return null;

  if (typeof error === "string") return <Ansi log={error} />;

  return (
    <div className="flex flex-col gap-2">
      <Ansi log={`${error.name}: ${error.message}`} />
      <Ansi log={error.stack ?? ""} />
    </div>
  );
}
