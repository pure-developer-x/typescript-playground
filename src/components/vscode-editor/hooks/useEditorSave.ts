import { PureFile } from '@/lib/pure-file';
import * as vscode from 'vscode';
import { atomEffect } from 'jotai-effect'
import { functionResourceAtoms } from '@/atoms/api/function-resource';
import { useAtom } from 'jotai';

const editorSaveAtom = atomEffect((get) => {
  const patchFunction = get(functionResourceAtoms.patch).mutate;

  const disposable = vscode.workspace.onDidSaveTextDocument(async (e) => {
    const func = PureFile.to_function(e.uri, get.peek(functionResourceAtoms.fetch).data || []);


    if (!func) return;

    patchFunction(
      {
        patch: {
          code: e.getText(),
        },
        id: func.id
      });
  });
  return () => disposable.dispose();
})

export function useEditorSave() {
  useAtom(editorSaveAtom);
}