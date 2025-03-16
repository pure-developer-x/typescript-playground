import { atom } from "jotai";
import { editor } from "monaco-editor";
import { atomEffect } from 'jotai-effect'

// VSCode Atoms
export const currentTextModelAtom = atom<editor.ITextModel | null>(null);
export const currentTextOfEditor = atom<string>('');

/**
 * Handles the subscription of the current text model
 * and updates the current text of the editor atom
 */
export const textModelSubscriptionAtom = atomEffect((get, set) => {
  const model = get(currentTextModelAtom);
  if (!model) return;

  set(currentTextOfEditor, model.getValue());
  const disposable = model.onDidChangeContent(() => {
    set(currentTextOfEditor, model.getValue());
  });

  return () => {
    disposable.dispose();
  }
})
