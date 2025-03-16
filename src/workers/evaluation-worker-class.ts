import { EvaluationContext } from "@/hooks/useEvalContext";
import { PureLogger } from "@/workers/pure-logger";
import { MockPureFetch } from "@/workers/mocks/mock-pure-fetch";
import { PureCompiler } from "@/workers/pure-compiler/pure-compiler";
import { MockRequire } from "@/workers/mocks/mock-require";

export class EvaluationWorker {
  private compartment: Compartment;
  private initialized = false;
  private logger = PureLogger.instance;
  private fetch: MockPureFetch;
  // @ts-ignore
  private context: EvaluationContext;
  private mockRequire: MockRequire;
  private exports: Record<string, unknown> = {};

  createCompartment(exports: Record<string, unknown>): Compartment {
    return new Compartment({
      console: harden({
        ...console,
        log: (...args: unknown[]) => {
          this.logger.log(...args);
        },
      }),
      fetch: this.fetch.fetch.bind(this.fetch),
      Headers,
      Request,
      Response,
      atob: (str: string) => {
        return atob(str);
      },
      crypto,
      btoa,
      URL,
      exports,
      Date,
      require: (modulePath: string) => {
        const module = this.mockRequire.require(modulePath);
        return module;
      },
      Math,
    });
  }

  constructor(context: EvaluationContext) {
    this.context = context;
    this.logger.init(context.uuid);
    this.fetch = new MockPureFetch(context);
    this.mockRequire = new MockRequire(
      context,
      this.createCompartment.bind(this)
    );
    this.compartment = this.createCompartment(this.exports);
  }

  async setup() {
    if (!this.initialized) {
      await PureCompiler.init();
      this.initialized = true;
    }
    this.compartment.globalThis.exports = {}; // reset exports otherwise when we compile again it will have the previous exports and will not work
  }

  compile(value: string): string | undefined {
    try {
      this.logger.send({
        type: "compile",
        status: "compiling",
      });
      const compiled = new PureCompiler(value).compile();
      this.logger.send({
        type: "compile",
        status: "success",
      });
      return compiled;
    } catch (error) {
      this.logger.send({
        type: "compile",
        status: "error",
        error: error as string,
      });
      return;
    }
  }

  async evaluate(value: string): Promise<number> {
    this.logger.reset();
    const p1 = performance.now();
    await this.setup();
    const code = this.compile(value);
    if (!code) return performance.now() - p1;

    try {
      await this.compartment.evaluate(code);

    } catch (error) {
      this.logger.error(error || "Failed to evaluate code");
    }
    const p2 = performance.now();

    return p2 - p1;
  }
}
