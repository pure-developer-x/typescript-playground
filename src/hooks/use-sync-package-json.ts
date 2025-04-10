import packageJson from "@/components/vscode-editor/config/package.pure.json" assert { type: "json" };
import { useAtom } from "jotai";
import { atomEffect } from "jotai-effect";
import { PureVSCode } from "@/components/vscode-editor/pure-vscode";
import { dependenciesAtom } from "@/atoms/dependency-atom";


const syncPackageJsonEffectAtom = atomEffect((get) => {
  const dependencies = get(dependenciesAtom);

  const json = { ...packageJson };

  const modules = dependencies.reduce((nodeModules, dependency) => {
    nodeModules[dependency.name] = dependency.version;
    return nodeModules;
  }, {} as Record<string, string>);


  json.dependencies = {
    ...json.dependencies,
    ...modules,
  };

  const disposable = PureVSCode.instance.createFile(
    "package.json",
    JSON.stringify(json, null, 2)
  );

  return () => {
    disposable.dispose();
  };
});

export function useSyncPackageJson() {
  useAtom(syncPackageJsonEffectAtom);
}
