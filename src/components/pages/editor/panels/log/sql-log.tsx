import { LogTag } from "@/components/pages/editor/panels/log/common/log-tag";
import { LogWrapper } from "@/components/pages/editor/panels/log/common/log-wrapper";
import { VStack } from "@/components/ui/vstack";
import { QueryResult, SqlWrapper } from "./sql/components";
import { SqlMessage } from "@/lib/logs";

export function SqlLog({ compiled, hash }: SqlMessage) {
  return <_SqlLog compiled={compiled} type={"sql"} hash={hash} />;
}

function _SqlLog({ compiled, hash }: SqlMessage) {
  return (
    <LogWrapper>
      <LogTag className="bg-yellow-800">SQL</LogTag>
      <VStack className="w-full border divide-y gap-0 divide-border">
        <SqlWrapper compiled={compiled} />
        <QueryResult hash={hash} />
      </VStack>
    </LogWrapper>
  );
}
