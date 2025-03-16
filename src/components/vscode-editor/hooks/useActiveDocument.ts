import { IDisposable } from "monaco-editor";
import { useEffect, useState } from "react";
import * as vscode from "vscode";
import {
  EditorInput,
  IEditorService,
  IVisibleEditorPane,
  getService,
} from "vscode/services";

const GroupModelChangeKind = {
  GROUP_ACTIVE: 0,
  GROUP_INDEX: 1,
  GROUP_LABEL: 2,
  GROUP_LOCKED: 3,
  EDITORS_SELECTION: 4,
  EDITOR_OPEN: 5,
  EDITOR_CLOSE: 6,
  EDITOR_MOVE: 7,
  EDITOR_ACTIVE: 8,
  EDITOR_LABEL: 9,
  EDITOR_CAPABILITIES: 10,
  EDITOR_PIN: 11,
  EDITOR_TRANSIENT: 12,
  EDITOR_STICKY: 13,
  EDITOR_DIRTY: 14,
  EDITOR_WILL_DISPOSE: 15,
};

export function useActiveDocument() {
  const [activeDocument, setActiveDocument] = useState<vscode.TextDocument>();
  const [activePane, setActivePane] = useState<IVisibleEditorPane | null>();
  const [activeEditor, setActiveEditor] = useState<EditorInput>();
  const [isDirty, setIsDirty] = useState(false);


  useEffect(() => {
    const dispose = vscode.window.onDidChangeActiveTextEditor((e) => {
      if (e?.document.uri.scheme !== "file") return;

      setActiveDocument(e?.document);

    });
    return () => {
      dispose.dispose();
    };
  }, []);

  useEffect(() => {
    const disposables: IDisposable[] = [];

    (async () => {
      const service = await getService(IEditorService);
      service.onDidEditorsChange((e) => {
        switch (e.event.kind) {
          case GroupModelChangeKind.EDITOR_ACTIVE:
            setIsDirty(e.event.editor?.isDirty() ?? false);
            setActivePane(service.activeEditorPane);
            setActiveEditor(e.event.editor);
            break;
          case GroupModelChangeKind.EDITOR_DIRTY:
            setIsDirty(e.event.editor?.isDirty() ?? false);
            break;
        }
      });
    })();

    return () => {
      disposables.forEach((d) => d.dispose());
    };
  }, []);

  return { isDirty, activeDocument, activePane, activeEditor };
}
