import { CompiledQuery } from "kysely";

type FetchResultCommon<T> = {
  url: string;
  headers: Record<string, string>;
  status: number;
  statusText: string;
} & T;
export type FetchResult =
  | FetchResultCommon<{ type: "json"; body: Record<string, unknown> }>
  | FetchResultCommon<{ type: "form"; body: Record<string, string> }>
  | FetchResultCommon<{ type: "text"; body: string }>
  | FetchResultCommon<{ type: "binary"; body: ArrayBuffer }>
  | FetchResultCommon<{ type: "none"; body?: null | undefined }>;


export type Methods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type OutBoundRequest = {
  url: string;
  method: Methods;
  headers: Record<string, string>;
  body: unknown;
};


export type MessageTypeIndexed = { executionId: string } & MessageType;

export type MessageType =
  | LogMessage
  | ErrorMessage
  | WarnMessage
  | FetchMessage
  | InBoundResponseMessage
  | InBoundNotFoundMessage
  | SqlMessage
  | LogResponse
  | LoadingEsmMessage
  | CompileMessage;

export type LogMessage = {
  messages: unknown[];
  type: "log";
};

export type LogResponse = {
  type: "response";
  responseType: 'json' | 'html' | 'text' | 'file' | 'redirect' | 'error' | 'warn' | 'array-buffer' | 'readable-stream';
  response: unknown;
}

export type ErrorMessage = {
  messages: unknown[];
  type: "error";
  stack?: string;
};

export type WarnMessage = {
  messages: unknown[];
  type: "warn";
};

export type FetchMessage = {
  type: "fetch";
  request: {
    url: string;
    method: Methods;
    headers: Record<string, string>;
    body: unknown;
  };
  hash: string;
};

export type InBoundResponseMessage = {
  type: "in-bound-response";
  request: FetchResult;
  hash: string;
};

export type InBoundNotFoundMessage = {
  type: "in-bound-not-found";
  origin: OutBoundRequest;
};

export type SqlMessage = {
  type: "sql";
  compiled: CompiledQuery;
  hash: string;
};

export type LoadingEsmMessage = {
  type: "loading-esm";
  status: "loading" | "loaded" | "error";
  module: string;
};

export type CompileMessage = {
  type: "compile";
  status: 'error' | 'success' | 'compiling';
  error?: {
    stack?: string;
    name: string;
    message: string;
  } | string;
};
