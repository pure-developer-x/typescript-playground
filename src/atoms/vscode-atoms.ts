import { atom } from "jotai";
import { editor } from "monaco-editor";
import { atomEffect } from 'jotai-effect'
import { atomWithStorage } from "jotai/utils";
import sampleCode from "@/assets/sample-code?raw";

// VSCode Atoms
export const currentTextModelAtom = atom<editor.ITextModel | null>(null);
export const currentTextOfEditor = atomWithStorage<string>('saved-code', sampleCode);

/**
 * Handles the subscription of the current text model
 * and updates the current text of the editor atom
 */
export const textModelSubscriptionAtom = atomEffect((get, set) => {
  const model = get(currentTextModelAtom);
  const savedCode = get.peek(currentTextOfEditor);
  if (!model) return;

  const disposable = model.onDidChangeContent(() => {
    set(currentTextOfEditor, model.getValue());
  });

  model.setValue(savedCode);

  return () => {
    disposable.dispose();
  }
})
