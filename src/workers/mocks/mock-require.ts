import { EvaluationContext } from "@/hooks/useEvalContext";
import { EsmResolve } from "@/workers/esm/esm-resolver";

export class MockRequire {
  exports: Record<string, unknown> = {};
  constructor(
    // @ts-ignore
    private _context: EvaluationContext,
    // @ts-ignore
    private _createCompartment: (exports: Record<string, unknown>) => Compartment
  ) { }

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

    return EsmResolve.resolve(module);
  }
}
