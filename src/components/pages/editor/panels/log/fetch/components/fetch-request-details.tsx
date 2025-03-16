import { Button } from "@/components/ui/button";
import { PureInspector } from "@/components/ui/pure-inspector";
import { PlayIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { HStack } from "@/components/ui/hstack";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { CollapsibleHeaders } from "@/components/pages/editor/panels/log/fetch/components/collapsible-headers";
import { CollapsibleChevron } from "@/components/pages/editor/panels/log/fetch/components/collapsible-chevron";
import {
  executeFetchAtom,
  FetchInputType,
} from "@/components/pages/editor/panels/log/fetch-log";

export function ExecuteFetchButton({
  request,
  hash,
}: {
  request: FetchInputType;
  hash: string;
}) {
  const [{ mutateAsync: executeSql, isPending }] = useAtom(executeFetchAtom);

  return (
    <Button
      size="md-icon"
      data-driver="execute-fetch"
      className="absolute top-0 right-0"
      variant="ghost"
      isLoading={isPending}
      onClick={async () => {
        console.log("executing fetch", request, hash);
        executeSql({ request, hash });
      }}
    >
      <PlayIcon />
    </Button>
  );
}

export function FetchRequestDetails({
  headers,
  body,
}: {
  headers: Record<string, string>;
  body: unknown;
}) {
  const [isBodyOpen, setIsBodyOpen] = useState(false);

  return (
    <div className="text-xs">
      <CollapsibleHeaders headers={headers} label="Request Headers" />

      {body !== undefined && body !== null && (
        <Collapsible open={isBodyOpen} onOpenChange={setIsBodyOpen}>
          <CollapsibleTrigger className="w-full group">
            <HStack className="justify-between py-0.5 px-2 hover:bg-muted/50 transition-colors">
              <span className="text-muted-foreground">Request Body</span>
              <CollapsibleChevron open={isBodyOpen} />
            </HStack>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pb-1 px-2">
              <PureInspector data={body} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
