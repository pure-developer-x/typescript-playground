import { LogTag } from "@/components/pages/editor/panels/log/common/log-tag";
import { LogWrapper } from "@/components/pages/editor/panels/log/common/log-wrapper";
import { Ansi } from "@/components/ui/ansi";
import { VStack } from "@/components/ui/vstack";
import { ErrorMessage } from "@/lib/logs";

export function ErrorLog({ messages, stack }: ErrorMessage) {
  return (
    <LogWrapper>
      <LogTag className="bg-red-800">Error</LogTag>
      <VStack>
        <span className="text-xs text-destructive">
          {messages.map((message) => {
            if (typeof message === "string") {
              return <Ansi key={message} log={message} />;
            } else {
              return String(message);
            }
          })}
        </span>
        {stack && <Ansi log={stack} />}
      </VStack>
    </LogWrapper>
  );
}
