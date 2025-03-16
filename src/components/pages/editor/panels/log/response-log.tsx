import { LogResponse } from "@/lib/logs";
import { LogTag } from "@/components/pages/editor/panels/log/common/log-tag";
import { LogWrapper } from "@/components/pages/editor/panels/log/common/log-wrapper";
import { PureInspector } from "@/components/ui/pure-inspector";

export function ResponseLog({ response }: LogResponse) {
  return (
    <LogWrapper>
      <LogTag className="bg-purple-900">Res</LogTag>
      <PureInspector data={response} />
    </LogWrapper>
  );
}
