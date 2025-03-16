import { IDisposable, editor } from "monaco-editor";
import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
} from "@codingame/monaco-vscode-files-service-override";
import { IEditorService, getService, initialize } from "vscode/services";
import { PureFile } from "@/lib/pure-file";
import pureModule from "@/assets/pure.d.ts?raw";
import pureInterfaceModule from "@/assets/pure-interface.d.ts?raw";
import tsconfig from "./config/tsconfig.pure.json?raw";
import { initializeVSCodeEditor } from "@/components/vscode-editor/setup";

export class PureVSCode {
  private static _instance: PureVSCode | null = null;

  public static INTERNAL_FILES = {
    tsconfig: "tsconfig.json",
    pureModule: "pure.d.ts",
    parametersTypescript: "__pure__/parameters-typescript.ts",
    parametersJsonSchema: "__pure__/parameters-json-schema.json",
    parametersSample: "__pure__/parameters-sample.json",
    tablesTypes: "__pure__/tables-types.ts",
    variables: (id: number) => `__pure__/variables/variable_${id}.ts`,
    variables_definitions: (id: number) => `__pure__/variables/variable_${id}.d.ts`,
    __DEPRECATED_FILE: (prefix: string, ext: string) => `__pure__/file_${prefix}${ext}`,
  }

  private constructor() { }

  private fileSystemProvider: RegisteredFileSystemProvider = undefined!;
  public commonServices: editor.IEditorOverrideServices = undefined!;
  public workbenchSettings: any = undefined!;
  public lastOpenedFile: string | null = null;

  static get instance() {
    this._instance = this._instance || new PureVSCode();
    return this._instance;
  }

  async init() {
    const { commonServices, fileSystemProvider, workbenchSettings } =
      await initializeVSCodeEditor();
    this.commonServices = commonServices;
    this.fileSystemProvider = fileSystemProvider;
    this.workbenchSettings = workbenchSettings;
    this.createFile("tsconfig.json", tsconfig);
    this.createFile("pure.d.ts", pureModule);
    this.createFile('pure-interface.d.ts', pureInterfaceModule)
    await initialize({ ...commonServices }, document.body, workbenchSettings);

  }

  createFile(file: string, content: string | Uint8Array) {
    try {
      const registerFile = new RegisteredMemoryFile(
        PureFile.createUri(file),
        content
      );

      const disposable = this.fileSystemProvider.registerFile(registerFile);

      return disposable;
    } catch (error) {
      console.warn(file, error);
      return { dispose: () => { } } satisfies IDisposable;
    }
  }

  async restart() {
    const tsconfigFile = PureFile.createUri("tsconfig.json");
    const tsconfig = await this.fileSystemProvider.readFile(tsconfigFile);
    await this.fileSystemProvider.writeFile(tsconfigFile, tsconfig, {
      overwrite: true,
      atomic: false,
      create: true,
      unlock: true,
    });
  }

  async edit(file: string, content: string | Uint8Array) {
    await this.fileSystemProvider.writeFile(
      PureFile.createUri(file),
      typeof content === 'string' ? new TextEncoder().encode(content) : content,
      {
        overwrite: true,
        atomic: false,
        create: true,
        unlock: true,
      }
    );
  }

  async getContent(file: string) {
    const content = await this.fileSystemProvider.readFile(
      PureFile.createUri(file)
    );

    return new TextDecoder().decode(content);
  }

  async exists(file: string) {
    try {
      return Boolean(
        await this.fileSystemProvider.stat(PureFile.createUri(file))
      );
    } catch (error) {
      return false;
    }
  }

  async open(file: string) {
    if (!(await this.exists(file))) return;
    const service = await getService(IEditorService);

    const editor = await service.openEditor({
      resource: PureFile.createUri(file),
    });

    if (!editor) return;

    return editor;
  }
}
