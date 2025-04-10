import { atom, ExtractAtomValue, getDefaultStore, Setter, useAtom } from "jotai";
import { Getter } from "jotai";
import * as Comlink from "comlink";
import { EvaluationWorker as EvaluationWorkerClass } from "@/workers/evaluation-worker-class";
import { debounce } from "lodash";
import { CompileMessage, LoadingEsmMessage, MessageTypeIndexed } from "@/lib/logs";
import { atomEffect } from "jotai-effect";
import { currentTextOfEditor } from "@/atoms/vscode-atoms";
import { fetchHashLookupAtom } from "@/components/pages/editor/panels/log/fetch-log";
import { dependenciesAtom } from "@/atoms/dependency-atom";

export type EvaluationContext = ExtractAtomValue<typeof useEvalAtom>;


const rerenderCountAtom = atom(0);
const lastEvaluationIdAtom = atom<number>(0);
export const lastEvaluationTimeAtom = atom<number>(0);
export const esmStatusAtom = atom<Record<string, { name: string, status: LoadingEsmMessage["status"] }>>({});
export const compileStatusAtom = atom<CompileMessage | null>(null);
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
  const fetchMocks = get(fetchHashLookupAtom);
  const dependencies = get(dependenciesAtom);
  const executionId = getDefaultStore().get(lastEvaluationIdAtom) + 1;
  getDefaultStore().set(lastEvaluationIdAtom, executionId);


  return {
    value: code,
    sqlMocks: {} as Record<string, { value: { results: { rows: any[] } } }>,
    fetchMocks,
    dependencies,
    executionId,
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
    if (message.executionId < lastEvaluationId) return; // ignore logs from previous executions

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
          set(rerenderCountAtom, (prev) => prev + 1);
        }
        break;
      case "compile": {
        set(compileStatusAtom, message);
        if (message.status === "success" || message.status === "error") {
          set(logsAtom, logs => {
            return [...logs.filter(log => log.executionId === lastEvaluationId)];
          });
        }
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
