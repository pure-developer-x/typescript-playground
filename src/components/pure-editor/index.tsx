import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { VSCodeEditor } from "@/components/vscode-editor/vscode-editor";
import { logsAtom } from "@/hooks/useEvalContext";
import { useAtomValue } from "jotai";

export function PureEditor() {
  return (
    <div className="h-full">
      <ResizablePanelGroup direction="vertical" className="h-full">
        <ResizablePanel defaultSize={60}>
          <VSCodeEditor file="test.ts" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={40}>
          <Logs />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function Logs() {
  const logs = useAtomValue(logsAtom);
  return (
    <div className="h-full p-4">
      {logs.map((log) => (
        <div key={log.executionId}>{JSON.stringify(log, null, 2)}</div>
      ))}
    </div>
  );
}
