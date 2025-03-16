import * as Comlink from "comlink";
import { EvaluationWorker } from "./evaluation-worker-class";
import "ses";

if (globalThis?.global?.process) {
  // @ts-expect-error - Lockdown fails if process is not deleted
  delete global.process;
}

lockdown({
  __hardenTaming__: 'unsafe',
  errorTaming: "unsafe",
});
console.log("Worker created");
Comlink.expose(EvaluationWorker);
