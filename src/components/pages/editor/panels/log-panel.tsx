import { logsAtom } from "@/hooks/useEvalContext";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom } from "jotai";
import { useThrottle } from "@uidotdev/usehooks";
import { SqlLog } from "@/components/pages/editor/panels/log/sql-log";
import { FetchLog } from "@/components/pages/editor/panels/log/fetch-log";
import { ErrorLog } from "@/components/pages/editor/panels/log/error-log";
import { SimpleLog } from "@/components/pages/editor/panels/log/simple-log";
import { ResponseLog } from "@/components/pages/editor/panels/log/response-log";
import { HStack } from "@/components/ui/hstack";
import { CompileStatus } from "./log/compile/compile-status";
import { MessageType } from "@/lib/logs";

export function LogPanel() {
  const [logs] = useAtom(logsAtom);
  const throttledLogs = useThrottle(logs, 50);
  const virtualizer = useVirtualizer({
    count: throttledLogs.length,
    getScrollElement: () => document.getElementById("log-scroll-view-port"),
    estimateSize: () => 45,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="h-full" data-driver="log-panel">
      <TopBar />
      <div
        id="log-scroll-view-port"
        className="h-[calc(100%-2rem)] overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-background overflow-clip"
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${items[0]?.start ?? 0}px)`,
            }}
          >
            {items.map((virtualRow) => {
              return (
                <div
                  className={"mx-1 py-1 px-1 flex gap-2 items-center flex-wrap"}
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                >
                  <Log messageType={throttledLogs[virtualRow.index]} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Log({ messageType }: { messageType: MessageType }) {
  switch (messageType.type) {
    case "sql":
      return <SqlLog {...messageType} />;
    case "fetch": {
      return <FetchLog {...messageType} />;
    }
    case "error":
      return <ErrorLog {...messageType} />;
    case "log":
      return <SimpleLog {...messageType} />;
    case "response":
      return <ResponseLog {...messageType} />;
    case "loading-esm":
      return null;
    case "compile":
      return null;
  }
  throw new Error("Unknown message type");
}

function TopBar() {
  return (
    <HStack className="pl-2 pr-4 h-8 justify-between items-center">
      <span className="text-xs text-gray-400">Interactive Logs</span>
      <HStack className="gap-4">
        <CompileStatus />
      </HStack>
    </HStack>
  );
}
