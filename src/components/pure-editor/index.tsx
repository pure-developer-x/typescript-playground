import { VSCodeEditor } from "../vscode-editor/vscode-editor";

export function PureEditor() {
  return (
    <div className="h-full grid grid-cols-1 grid-rows-2 gap-1">
      <div className="col-start-1 row-start-1 col-span-1 row-span-1">
        <VSCodeEditor file="test.ts" />
      </div>
      <div className="col-start-1 row-start-2 col-span-1 row-span-1"></div>
    </div>
  );
}
