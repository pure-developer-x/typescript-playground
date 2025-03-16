import { atom, ExtractAtomValue, Setter, useAtom } from "jotai";
import { Getter } from "jotai";
import * as Comlink from "comlink";
import { EvaluationWorker as EvaluationWorkerClass } from "@/workers/evaluation-worker-class";
import { debounce } from "lodash";
import { CompileMessage, LoadingEsmMessage, MessageTypeIndexed } from "@/lib/logs";
import { atomEffect } from "jotai-effect";
import { currentTextOfEditor } from "@/atoms/vscode-atoms";

export type EvaluationContext = ExtractAtomValue<typeof useEvalAtom>;


const rerenderCountAtom = atom(0);
const lastEvaluationIdAtom = atom<string>("");
const lastEvaluationTimeAtom = atom<number>(0);
const esmStatusAtom = atom<Record<string, { name: string, status: LoadingEsmMessage["status"] }>>({});
const compileStatusAtom = atom<CompileMessage | null>(null);
export const logsAtom = atom<MessageTypeIndexed[]>([]);

const evalWorker = new Worker(
  new URL("@/workers/evaluation-worker.ts", import.meta.url),
  {
    type: "module",
  }
);
const EvaluationWorker = Comlink.wrap<typeof EvaluationWorkerClass>(evalWorker);


const debounceEvaluate = debounce(
  (context: EvaluationContext, get: Getter, set: Setter) => {
    evalWorker.onmessage = handleMessage(get, set);
    const worker = new EvaluationWorker(context);
    worker
      .then((w) => w.evaluate(context.value))
      .then((evalTime) => set(lastEvaluationTimeAtom, evalTime));
  },
  50,
  {}
);

const useEvalAtom = atom((get) => {
  const code = get(currentTextOfEditor);
  const uuid = crypto.randomUUID();

  return {
    value: code,
    sqlMocks: {},
    uuid,
  }
});

const evaluationContextSubscriptionAtom = atomEffect((get, set) => {
  const context = get(useEvalAtom);
  debounceEvaluate(context, get, set);
});

export function useEvalContext() {
  useAtom(evaluationContextSubscriptionAtom);
}




function handleMessage(get: Getter, set: Setter) {
  return function (event: MessageEvent<{ type: "log"; log: MessageTypeIndexed }>) {
    if (event.data.type !== "log") return; // ignore non-log message coming from comlink
    const lastEvaluationId = get(lastEvaluationIdAtom);
    const message = event.data.log;

    switch (message.type) {
      case "loading-esm":
        set(esmStatusAtom, (prev) => {
          return {
            ...prev,
            [message.module]: {
              name: message.module,
              status: message.status,
            },
          };
        });
        if (message.status === "loaded") {
          console.log("rerender");
          set(rerenderCountAtom, (prev) => prev + 1);
        }
        break;
      case "compile": {
        set(compileStatusAtom, message);
        break;
      }
      default: {
        set(logsAtom, logs => {
          return [...logs.filter(log => log.executionId === lastEvaluationId), message];
        });
        break;
      }
    }
  }
}
