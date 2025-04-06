import { IEditorOverrideServices, LogLevel } from "@codingame/monaco-vscode-api";
import "./custom-extensions/pure-extension";
import "@codingame/monaco-vscode-json-language-features-default-extension";
import "@codingame/monaco-vscode-typescript-basics-default-extension";
import "@codingame/monaco-vscode-typescript-language-features-default-extension";
import "@codingame/monaco-vscode-json-default-extension";
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import "@codingame/monaco-vscode-theme-seti-default-extension";
import '@codingame/monaco-vscode-references-view-default-extension';
import "@codingame/monaco-vscode-search-result-default-extension";
import { workerConfig } from "./tools/extHostWorker";
import getConfigurationServiceOverride, {
  initUserConfiguration,
} from "@codingame/monaco-vscode-configuration-service-override";
import {
  RegisteredFileSystemProvider,
  RegisteredMemoryFile,
  registerFileSystemOverlay,
} from "@codingame/monaco-vscode-files-service-override";
import defaultConfiguration from "./config/user-config.json?raw";
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getSnippetServiceOverride from "@codingame/monaco-vscode-snippets-service-override";
import getExtensionServiceOverride from "@codingame/monaco-vscode-extensions-service-override";
import getExplorerServiceOverride from "@codingame/monaco-vscode-explorer-service-override";
import getSearchServiceOverride from '@codingame/monaco-vscode-search-service-override'
import getViewsServiceOverride, {
  OpenEditor,
} from "@codingame/monaco-vscode-views-service-override";
import { Worker } from "./tools/crossOriginWorker";
import "@/components/vscode-editor/vscode-editor.css";
import { Uri } from "monaco-editor";

export async function initializeVSCodeEditor() {
  const workspaceFile = Uri.file('/workspace.code-workspace');

  const fileSystemProvider = new RegisteredFileSystemProvider(false);


  fileSystemProvider.registerFile(
    new RegisteredMemoryFile(
      workspaceFile,
      JSON.stringify(
        {
          folders: [
            {
              path: "/workspace",
            },
          ],
        },
        null,
        2
      )
    )
  );

  registerFileSystemOverlay(1, fileSystemProvider);

  type WorkerLoader = () => Worker;
  const workerLoaders: Partial<Record<string, WorkerLoader>> = {
    TextEditorWorker: () =>
      new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
        type: 'module'
      }),
    TextMateWorker: () =>
      new Worker(
        new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url),
        { type: 'module' }
      ),
    LocalFileSearchWorker: () => new Worker(new URL('@codingame/monaco-vscode-search-service-override/worker', import.meta.url), { type: 'module' })
  };

  window.MonacoEnvironment = {
    getWorker: function (moduleId, label) {
      const workerFactory = workerLoaders[label];
      if (workerFactory != null) {
        return workerFactory();
      }
      throw new Error(`Unimplemented worker ${label} (${moduleId})`);
    },
  };

  await Promise.all([initUserConfiguration(defaultConfiguration)]);

  // await import("@codingame/monaco-vscode-typescript-basics-default-extension");
  // await import("@codingame/monaco-vscode-typescript-language-features-default-extension");

  const commonServices: IEditorOverrideServices = {
    ...getExtensionServiceOverride(workerConfig),
    ...getTextmateServiceOverride(),
    ...getLanguagesServiceOverride(),
    ...getConfigurationServiceOverride(),
    ...getThemeServiceOverride(),
    ...getSnippetServiceOverride(),
    ...getExplorerServiceOverride(),
    ...getViewsServiceOverride((async () => { }) as OpenEditor, undefined),
    ...getSearchServiceOverride(),
  };


  const workbenchSettings = {
    remoteAuthority: undefined,
    enableWorkspaceTrust: true,
    connectionToken: undefined,
    windowIndicator: {
      label: "monaco-vscode-api",
      tooltip: "",
      command: "",
    },
    developmentOptions: {
      logLevel: LogLevel.Info, // Default value
    },
    configurationDefaults: {

      "window.title":
        "Monaco-Vscode-Api${separator}${dirty}${activeEditorShort}",
    },
    welcomeBanner: {
      message: "Welcome in monaco-vscode-api demo",
    },
    productConfiguration: {
      nameShort: "monaco-vscode-api",
      nameLong: "monaco-vscode-api",
      extensionsGallery: {
        serviceUrl: "https://open-vsx.org/vscode/gallery",
        itemUrl: "https://open-vsx.org/vscode/item",
        resourceUrlTemplate:
          "https://open-vsx.org/vscode/unpkg/{publisher}/{name}/{version}/{path}",
        controlUrl: "",
        nlsBaseUrl: "",
        publisherUrl: "",
      },
    },
    workspaceProvider: {
      trusted: true,
      async open() {
        return true;
      },
      workspace: {
        workspaceUri: workspaceFile,
      },
    },
  };

  return { commonServices, workbenchSettings, fileSystemProvider };
}
