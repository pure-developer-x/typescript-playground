import { EvaluationContext } from "@/components/hooks/useEvalContext";
import { EsmResolve } from "@/workers/esm/esm-resolver";
import { PureCompiler } from "@/workers/pure-compiler/pure-compiler";

export class MockRequire {
  exports: Record<string, unknown> = {};
  constructor(
    private context: EvaluationContext,
    private createCompartment: (exports: Record<string, unknown>) => Compartment
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

  functionModule(module: string) {
    const relativeImport = "@/functions";
    const funcName = module.slice(relativeImport.length + 1);
    if (this.exports[funcName]) return this.exports;

    const func = this.context.functions.find((f) => f.name === funcName);
    if (!func) throw new Error(`Function ${funcName} not found`);

    const compiled = new PureCompiler(
      func?.code,
      {
        ...this.context,
        func,
      },
      true
    ).compile();

    this.createCompartment(this.exports).evaluate(compiled);

    return this.exports;
  }

  require(module: string) {
    this.validate(module);

    if (module.startsWith("@/functions")) {
      return this.functionModule(module);
    }

    return EsmResolve.resolve(module);
  }
}
