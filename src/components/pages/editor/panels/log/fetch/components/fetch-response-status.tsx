import { HStack } from "@/components/ui/hstack";
import { fetchHashLookupAtom } from "@/components/pages/editor/panels/log/fetch-log";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";

export function FetchResponseStatus({ hash }: { hash: string }) {
  const fetchMocks = useAtomValue(fetchHashLookupAtom);
  const mock = fetchMocks[hash]?.value;

  if (!mock?.response) return null;

  const { status, statusText } = mock.response;

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500/10 text-green-500";
    if (status >= 300 && status < 400)
      return "bg-yellow-500/10 text-yellow-500";
    if (status >= 400) return "bg-red-500/10 text-red-500";
    return "bg-muted text-muted-foreground";
  };

  return (
    <HStack className="flex-shrink-0">
      <div
        className={cn(
          "px-1.5 rounded-md text-xs font-medium",
          getStatusColor(status)
        )}
      >
        {status}
      </div>
      <span className="text-xs text-muted-foreground">{statusText}</span>
    </HStack>
  );
}
