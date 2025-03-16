import { LogPanel } from "@/components/pages/editor/panels/log-panel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { VSCodeEditor } from "@/components/vscode-editor/vscode-editor";

export function PureEditor() {
  return (
    <div className="h-full">
      <ResizablePanelGroup direction="vertical" className="h-full">
        <ResizablePanel defaultSize={60}>
          <VSCodeEditor file="test.ts" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={40}>
          <LogPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
