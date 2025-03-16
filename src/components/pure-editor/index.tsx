import { LogPanel } from "@/components/pages/editor/panels/log-panel";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VSCodeEditor } from "@/components/vscode-editor/vscode-editor";
import { ExternalLinkIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { toast } from "sonner";

export function PureEditor() {
  return (
    <div className="h-full flex flex-col">
      <SiteHeader />
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

function SiteHeader() {
  useEffect(() => {
    const timer = setTimeout(
      () => {
        toast(
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              Enjoying the playground? Try Pure Dev for the same interactive
              experience plus API creation, real-time logs, and built-in API
              testing, and so much more!
            </p>
            <Button
              variant="brand"
              size="sm"
              className="w-fit flex gap-2"
              tag="a"
              // @ts-ignore
              href="https://puredev.run"
              target="_blank"
              rel="noopener noreferrer"
            >
              Try Pure Dev
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          </div>,
          {
            duration: 15 * 1000,
            position: "bottom-right",
            closeButton: true,
          }
        );
      },
      2 * 60 * 1000
    ); // 2 minutes

    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="border-b mb-4">
      <div className="px-4 flex h-14 items-center justify-between">
        <div className="flex gap-2 items-center">
          <span className="font-semibold">TypeScript Playground</span>
          <Tooltip>
            <TooltipTrigger>
              <InfoCircledIcon className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              Your code stays private — nothing is sent to our servers.
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="brand"
          size="xs"
          tag={"a"}
          // @ts-ignore
          href="https://puredev.run"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <a>Pure Dev</a>
          <ExternalLinkIcon className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
