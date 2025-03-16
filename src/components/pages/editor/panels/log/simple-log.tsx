import { LogTag } from "@/components/pages/editor/panels/log/common/log-tag";
import { LogWrapper } from "@/components/pages/editor/panels/log/common/log-wrapper";
import { PureInspector } from "@/components/ui/pure-inspector";
import { LogMessage, WarnMessage } from "@/lib/logs";

export function SimpleLog({ messages, type }: LogMessage | WarnMessage) {
  return (
    <LogWrapper>
      <LogTag className={type === "log" ? "" : "bg-yellow-800"}>
        {type === "log" ? "Log" : "War"}
      </LogTag>
      {messages.map((message, index) => (
        <PureInspector key={index} data={message} />
      ))}
    </LogWrapper>
  );
}
