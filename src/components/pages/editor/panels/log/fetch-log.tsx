import { LogTag } from "@/components/pages/editor/panels/log/common/log-tag";
import { LogWrapper } from "@/components/pages/editor/panels/log/common/log-wrapper";
import { FetchResponseStatus } from "./fetch/components/fetch-response-status";
import { FetchResponseDetails } from "./fetch/components/fetch-response-details";
import { HStack } from "@/components/ui/hstack";
import { Spacer } from "@/components/ui/spacer";
import { VStack } from "@/components/ui/vstack";
import { methodTextColor } from "@/lib/method-colors";
import { cn } from "@/lib/utils";
import { ScopeProvider } from "jotai-scope";
import {
  ExecuteFetchButton,
  FetchRequestDetails,
} from "@/components/pages/editor/panels/log/fetch/components/fetch-request-details";
import { atom } from "jotai";
import { FetchMessage, Methods } from "@/lib/logs";

export const executeFetchAtom = atom(() => {
  return {
    mutateAsync: async (request: FetchInputType) => {
      console.log("executeFetch", request);
    },
    isPending: false,
  };
});
export type FetchInputType = {
  url: string;
  method: Methods;
  headers: Record<string, string>;
  body: unknown;
};

export function FetchLog({ request, hash }: FetchMessage) {
  return (
    <ScopeProvider atoms={[executeFetchAtom]}>
      <_FetchLog request={request} hash={hash} type="fetch" />
    </ScopeProvider>
  );
}

function _FetchLog({ request, hash }: FetchMessage) {
  return (
    <LogWrapper>
      <LogTag className="bg-blue-900">Req</LogTag>
      <FetchInput request={request} hash={hash} />
    </LogWrapper>
  );
}

function FetchInput({
  request,
  hash,
}: {
  request: FetchInputType;
  hash: string;
}) {
  return (
    <VStack className="w-full border divide-y gap-0 divide-border">
      <FetchView {...request} hash={hash} />
      <ExecuteFetchButton request={request} />
    </VStack>
  );
}

function FetchView({
  body,
  headers,
  method,
  url,
  hash,
}: FetchInputType & { hash: string }) {
  return (
    <div className="relative">
      {/* Method and URL */}
      <HStack className="text-xs px-2 py-1 bg-muted/30 border-b border-border">
        <span className={cn("font-mono font-medium", methodTextColor(method))}>
          {method}
        </span>
        <span className="text-muted-foreground font-mono truncate">{url}</span>
        <Spacer />
        <FetchResponseStatus hash={hash} />
      </HStack>
      <FetchRequestDetails headers={headers} body={body} />
      <FetchResponseDetails hash={hash} />
    </div>
  );
}
