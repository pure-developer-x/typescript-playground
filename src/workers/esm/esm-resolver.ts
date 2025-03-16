import { NpmPackage, parsePackage } from "@/lib/parse-package";
import { SafeEvaluationError } from "@/workers/execution-errors/ignored-error";
import { PureLogger } from "@/workers/pure-logger";

type ModuleCache = {
  loaded: boolean;
  module: unknown;
};
export class EsmResolve {
  private static cache = new Map<string, ModuleCache>();

  private static toEsmUrl(module: NpmPackage): string {
    const { name, path, version } = module;
    return "https://esm.sh/" + name + "@" + version + path;
  }

  public static resolve(moduleName: string): unknown {
    const parsedPackage = parsePackage(moduleName);

    if (!parsedPackage) {
      throw new Error(`Invalid package name: ${moduleName}`);
    }

    const url = EsmResolve.toEsmUrl(parsedPackage);

    if (EsmResolve.cache.has(url)) {
      return EsmResolve.cache.get(url)?.module;
    }
    EsmResolve.cache.set(url, { loaded: false, module: null });

    (async () => {
      try {
        PureLogger.instance.send({
          type: "loading-esm",
          module: parsedPackage.name,
          status: "loading",
        });
        const esmModule = await import(/* @vite-ignore */ url);
        EsmResolve.cache.set(url, {
          loaded: true,
          module: esmModule.default || esmModule,
        });
        PureLogger.instance.send({
          type: "loading-esm",
          module: parsedPackage.name,
          status: esmModule ? "loaded" : "error",
        });
        return EsmResolve.cache.get(url)!;

      } catch (error) {
        console.error(error);
        PureLogger.instance.send({
          type: "loading-esm",
          module: parsedPackage.name,
          status: "error",
        });
        return undefined;
      }
    })();
    throw new SafeEvaluationError(`${moduleName} is not loaded yet.`);
  }
}
