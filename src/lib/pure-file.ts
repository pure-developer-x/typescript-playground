import { getDefaultStore } from "jotai";
import * as monaco from "monaco-editor";
import { Uri } from "vscode";

export class PureFile {

  static AUTHORITY = "ts-nul-authority";
  static GLOBAL_SCHEME = "vscode-global-typings";
  static NODE_MODULES_REPLACEMENT = "node_modules";
  static ROOT_URI = "/workspace/";

  /**
   * Create a URI for a file in the workspace.
   * @param path - The path to the file. Do not include initial slash.
   * @returns
   */
  static create(path: string) {
    return this.createUri(path).toString(true);
  }

  /**
   * Create a URI for a file in the workspace.
   * @param path The path to the file. Do not include initial slash.
   */
  static createUri(path: string) {
    const combined = monaco.Uri.file(`${this.ROOT_URI}${path}`);
    return combined;
  }

  static createUriCustom(path: string) {
    const combined = monaco.Uri.file(`${this.ROOT_URI}${path}`);
    return combined
  }
}
