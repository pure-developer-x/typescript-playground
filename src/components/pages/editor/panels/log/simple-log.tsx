import { LogTag } from "@/components/pages/editor/panels/log/common/log-tag";
import { LogWrapper } from "@/components/pages/editor/panels/log/common/log-wrapper";
import { PureInspector } from "@/components/ui/pure-inspector";
import { LogMessage } from "@/lib/logs";

export function SimpleLog({ messages }: LogMessage) {
  return (
    <LogWrapper>
      <LogTag>Log</LogTag>
      {messages.map((message, index) => (
        <PureInspector key={index} data={message} />
      ))}
    </LogWrapper>
  );
}
