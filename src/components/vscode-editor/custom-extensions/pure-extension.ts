import * as vscode from "vscode";
import { registerExtension } from "@codingame/monaco-vscode-api/extensions";
import { formatWithCursor } from "prettier/standalone";
import * as monaco from "monaco-editor";
import { Plugin } from "prettier";
import 'vscode/localExtensionHost'


export function createPureExtension() {

  const { getApi } = registerExtension(
    {
      // The id is the publisher name concatenated with the extension name and separated by a dot.
      // ie pure.pure-extension
      name: "pure-extension",
      publisher: "pure",
      version: "1.0.0",
      engines: {
        vscode: "*",
      },
      enabledApiProposals: ["fileSearchProvider", "textSearchProvider"],
      contributes: {
        keybindings: [
          {
            command: "open-pure-command",
            key: "cmd+k",
            when: "editorTextFocus",
          },
          {
            command: "open-pure-command",
            key: "cmd+p",
            when: "editorTextFocus",
          },
        ],
      },
    },
    1,
    {
      system: true,
    }
  );

  void getApi().then(async (api) => {
    api.languages.registerDocumentFormattingEditProvider(
      { language: "typescript" },
      {
        provideDocumentFormattingEdits: formatDocument,
      }
    );

    console.log("Registering file search provider");
    api.workspace.registerFileSearchProvider("file", {
      async provideFileSearchResults() {
        return monaco.editor
          .getModels()
          .map((model) => model.uri)
          .filter((uri) => uri.scheme === "file");
      },
    });
    api.workspace.registerTextSearchProvider("file", {
      async provideTextSearchResults(query, _, progress) {
        for (const model of monaco.editor.getModels()) {
          const matches = model.findMatches(
            query.pattern,
            false,
            query.isRegExp ?? false,
            query.isCaseSensitive ?? false,
            (query.isWordMatch ?? false) ? " " : null,
            true
          );
          if (matches.length > 0) {
            const ranges = matches.map(
              (match) =>
                new api.Range(
                  match.range.startLineNumber,
                  match.range.startColumn,
                  match.range.endLineNumber,
                  match.range.endColumn
                )
            );
            progress.report({
              uri: model.uri,
              ranges,
              preview: {
                text: model.getValue(),
                matches: ranges,
              },
            });
          }
        }
        return {};
      },
    });

  });

  async function formatDocument(
    document: vscode.TextDocument
  ): Promise<vscode.TextEdit[]> {
    const edits: vscode.TextEdit[] = [];
    const unformattedText = document.getText();


    try {
      const parser = await import("prettier/parser-typescript");
      const esTree = (await import("prettier/plugins/estree")) as Plugin;

      const format = await formatWithCursor(unformattedText, {
        parser: "typescript",
        cursorOffset: 0,
        plugins: [parser, esTree],
      });
      edits.push({
        newText: format.formatted,
        range: new vscode.Range(
          document.positionAt(0),
          document.positionAt(unformattedText.length)
        ),
      });

      return edits;
    } catch (error) {
      console.error("Error formatting document", error);
    }

    return [];
  }
}

