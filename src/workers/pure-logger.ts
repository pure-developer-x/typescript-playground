import { MessageType, MessageTypeIndexed } from "@/lib/logs";
import { SafeEvaluationError } from "@/workers/execution-errors/ignored-error";

export class PureLogger {
  static logger: PureLogger;
  index: number = 0;
  executionId: number = 0;

  constructor() {
    PureLogger.logger = this;
  }

  static get instance() {
    if (!PureLogger.logger) return new PureLogger();

    return PureLogger.logger;
  }

  reset() {
    this.index = 0;
  }

  init(executionId: number) {
    this.executionId = executionId;
  }

  send_log(args: unknown[], type: MessageType["type"]) {
    const log: MessageType = {
      type,
      messages: args,
    } as MessageType;
    this.send(log);
  }

  send(message: MessageType) {
    try {
      postMessage({ type: "log", log: { ...message, executionId: this.executionId } satisfies MessageTypeIndexed });
    } catch {
      const error = new Error(
        "We super sorry, but we can't log this message locally! Check the browser console for more information."
      );
      console.log("Tried to send log message but failed:", message);
      error.name = "PureLoggerError";
      this.error(error);
    }
  }

  log(...args: unknown[]) {
    this.send_log(args, "log");
  }

  log_error(...args: unknown[]) {
    this.send_log(args, "error");
  }


  error(error: unknown) {
    if (error instanceof SafeEvaluationError) {
      return;
    }

    if (error instanceof Error) {
      this.send({
        type: "error",
        messages: [`${error.name}: ${error.message}`],
        stack: error.stack,
      });
    } else {
      this.send({
        type: "error",
        messages: [error],
      });
    }
  }

  warn(...args: unknown[]) {
    this.send_log(args, "warn");
  }
}
