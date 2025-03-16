
type PartitionCookieConstraint =
  | { partition: true; secure: true }
  | { partition?: boolean; secure?: boolean } // reset to default
type CookiePrefixOptions = 'host' | 'secure'

type IPureCookieOptions = {
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  secure?: boolean
  signingSecret?: string
  sameSite?: 'Strict' | 'Lax' | 'None'
  partitioned?: boolean
  prefix?: CookiePrefixOptions
} & PartitionCookieConstraint


type SimplePureContext = {
  Json: unknown,
  Database: unknown,
  Variables: unknown,
  Headers: unknown,
  Queries: unknown,
  Params: unknown,
  Response: unknown
}

type SSEMessage = {
  data: string | Promise<string>
  event?: string
  id?: string
  retry?: number
}
type StreamAPI = {
  writeSSE: (message: SSEMessage) => Promise<void>
  close: () => Promise<void>
}

type SSECallback = (stream: StreamAPI) => void

interface IPure<PureContext extends SimplePureContext> {
  req: IPureRequest<PureContext['Json'], PureContext['Headers'], PureContext['Queries'], PureContext['Params']>;
  db: PureContext['Database'];
  getCookie(key: string): string | undefined;
  setCookie(name: string, value: string, options?: IPureCookieOptions): void;
  deleteCookie(name: string, option?: IPureCookieOptions): void;
  set(key: string, value: unknown): void;
  var: PureContext['Variables'];
  Error: any;
  status(code: number): void;
  error<T>(data: T, status?: number, headers?: Record<string, string>): PureContext['Response'];
  json<T>(data: T, status?: number, headers?: Record<string, string>): PureContext['Response'];
  text(data: string, status?: number, headers?: Record<string, string>): PureContext['Response'];
  html(data: string, status?: number, headers?: Record<string, string>): PureContext['Response'];
  arrayBuffer(data: ArrayBuffer, status?: number, headers?: Record<string, string>): PureContext['Response'];
  readableStream(data: ReadableStream, status?: number, headers?: Record<string, string>): PureContext['Response'];
  redirect(url: string, status?: number): PureContext['Response'];
  streamSSE(cb: SSECallback): PureContext['Response'];
}

interface IPureRequest<JSON, Headers, Queries, Params> {
  body: JSON;
  headers: Headers;
  blob(): Promise<Blob>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  formData(): Promise<FormData>;
  raw(): Promise<Request>;
  queries: Queries;
  params: Params;
  method: string;
  url: string;
  path: string;
}



