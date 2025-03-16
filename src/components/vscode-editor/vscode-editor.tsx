import { IModelService, getService } from "vscode/services";
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import "@codingame/monaco-vscode-theme-seti-default-extension";
import "vscode/localExtensionHost";
import "vscode/localExtensionHost";
import {
  Parts,
  attachPart,
} from "@codingame/monaco-vscode-views-service-override";
import { memo, useEffect } from "react";
import "@/components/vscode-editor/vscode-editor.css";
import { PureFile } from "@/lib/pure-file";
import { useMount } from "@/hooks/useMount";
import { useAtom, useSetAtom } from "jotai";
import {
  currentTextModelAtom,
  textModelSubscriptionAtom,
} from "@/atoms/vscode-atoms";
import { PureVSCode } from "@/components/vscode-editor/pure-vscode";
import { useEvalContext } from "@/hooks/useEvalContext";

type VSCodeEditorProps = {
  file: string;
  onInitialized?: (pureVsCode: PureVSCode) => void;
};

async function start() {
  attachPart(
    "workbench.parts.editor" as Parts,
    document.querySelector<HTMLDivElement>("#editor")!
  );
}

function InternalVSCodeEditor({ file, onInitialized }: VSCodeEditorProps) {
  useAtom(textModelSubscriptionAtom);
  useEvalContext();

  const setTextModelAtom = useSetAtom(currentTextModelAtom);

  useMount(async () => {
    await start();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onInitialized && onInitialized(PureVSCode.instance);
  });

  useEffect(() => {
    const disposable = PureVSCode.instance.createFile(file, "");

    (async () => {
      const opened = await PureVSCode.instance.open(file);
      if (!opened) return;

      const modelService = await getService(IModelService);
      const model = modelService.getModel(PureFile.createUri(file));
      setTextModelAtom(model);
    })();

    return () => {
      disposable.dispose();
    };
  }, [file, setTextModelAtom]);

  return (
    <div className="h-full mt-4">
      <div id="editor" className="relative w-full h-full"></div>
    </div>
  );
}

export const VSCodeEditor = memo(InternalVSCodeEditor);
