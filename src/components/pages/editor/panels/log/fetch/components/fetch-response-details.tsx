import { fetchHashLookupAtom } from "@/components/pages/editor/panels/log/fetch-log";
import { CollapsibleBody } from "@/components/pages/editor/panels/log/fetch/components/collapsible-body";
import { CollapsibleHeaders } from "@/components/pages/editor/panels/log/fetch/components/collapsible-headers";
import { PlayIcon } from "@radix-ui/react-icons";
import { useAtomValue } from "jotai";

export function FetchResponseDetails({ hash }: { hash: string }) {
  const fetchMocks = useAtomValue(fetchHashLookupAtom);
  const mock = fetchMocks[hash]?.value;

  if (!mock?.response) {
    return (
      <div className="w-full px-2 py-0.5 text-xs text-muted-foreground bg-muted/30">
        <span className="flex items-center gap-1">
          <PlayIcon className="w-3 h-3" />
          Ready to execute
        </span>
      </div>
    );
  }

  const { headers, body, type } = mock.response;

  return (
    <div className="border-t" data-driver="response-details">
      <CollapsibleHeaders headers={headers} label="Response Headers" />
      <CollapsibleBody body={body} label="Response Body" type={type} />
    </div>
  );
}
