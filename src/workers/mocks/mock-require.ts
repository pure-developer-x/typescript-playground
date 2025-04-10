import { EvaluationContext } from "@/hooks/useEvalContext";
import { EsmResolve } from "@/workers/esm/esm-resolver";

export class MockRequire {
  exports: Record<string, unknown> = {};
  dependencies: Set<string> = new Set();

  constructor(
    // @ts-ignore
    private context: EvaluationContext,
    // @ts-ignore
    private _createCompartment: (exports: Record<string, unknown>) => Compartment
  ) {
    this.dependencies = new Set(this.context.dependencies.map((dependency) => dependency.name));
  }

  validate(module: string) {
    if (
      module.startsWith(".") ||
      module.startsWith("/") ||
      module.startsWith("..") ||
      module.startsWith("~")
    ) {
      throw new Error("Relative imports are not allowed");
    }

    if (module.startsWith("@/routes")) {
      throw new Error("Nosferatu! Routes are not allowed to be referenced!");
    }
  }

  require(module: string) {
    this.validate(module);

    if (!this.dependencies.has(module)) {
      throw new Error(`The module ${module} is not installed. Please install it using the import button.`);
    }
    return EsmResolve.resolve(module);
  }
}
