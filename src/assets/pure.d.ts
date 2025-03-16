/* eslint-disable @typescript-eslint/no-unused-vars */
import { Context } from "hono";
import { type Kysely, type ColumnType, Selectable as KyselySelectable, SelectQueryBuilder } from "kysely";




declare global {
  class PureError implements Error {
    name: string;
    message: string;
    constructor(status: number, message: string);
  }

  type DynamicContext = {
    Database: Kysely<InternalPure.DB>;
    Headers: InternalPure.PureRequest['headers'];
    Json: InternalPure.PureRequest['body'];
    Params: InternalPure.PureRequest['params'];
    Queries: InternalPure.PureRequest['queries'];
    Variables: InternalPure.PureRequest['vars'];
    Response: PureResponse
  };

  /**
   * Pure is thin wrapper around the Hono framework that provides a simple
   * interface for working with HTTP requests and responses, as well as
   * interacting with a database. It is designed so that we can change the underlying
   * implementation without changing the user-facing API.
   * 
   * Send a JSON response with a status code of 200.
   * @example
   * ```ts
   * handler(pure) {
   *  return pure.json({ message: "Hello, world!" });
   * }
   * ```
   * 
   * Access the request body.
   * @example
   * ```ts
   * handler(pure) {
   *  const body = pure.req.body;
   *  return pure.json(body);
   * }
   * ```
   * Create a new record in the database.
   * @example
   * ```ts
   * handler(pure) {
   *  const { name, email } = pure.req.body;
   *  const user = await pure.db
   *    .insert("users", { name, email })
   *    .returningAll()
   *    .executeTakeFirst();
   * 
   *  return pure.json(user);
   * } 
   * ```
   */
  type Pure = IPure<DynamicContext>

  type Next = () => Promise<void>;
  interface PureResponse {
    readonly headers: Headers;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly type: ResponseType;
    readonly url: string;
    clone(): Response;
    /** A simple getter used to expose a `ReadableStream` of the body contents. */
    readonly body: ReadableStream<Uint8Array> | null;
    /** Stores a `Boolean` that declares whether the body has been used in a
     * response yet.
     */
    readonly bodyUsed: boolean;
    /** Takes a `Response` stream and reads it to completion. It returns a promise
     * that resolves with an `ArrayBuffer`.
     */
    arrayBuffer(): Promise<ArrayBuffer>;
    /** Takes a `Response` stream and reads it to completion. It returns a promise
     * that resolves with a `Blob`.
     */
    blob(): Promise<Blob>;
    /** Takes a `Response` stream and reads it to completion. It returns a promise
     * that resolves with a `Uint8Array`.
     */
    bytes(): Promise<Uint8Array>;
    /** Takes a `Response` stream and reads it to completion. It returns a promise
     * that resolves with a `FormData` object.
     */
    formData(): Promise<FormData>;
    /** Takes a `Response` stream and reads it to completion. It returns a promise
     * that resolves with the result of parsing the body text as JSON.
     */
    json(): Promise<unknown>;
    /** Takes a `Response` stream and reads it to completion. It returns a promise
     * that resolves with a `USVString` (text).
     */
    text(): Promise<string>;
  }

  type Console = {
    log(...args: unknown[]): void;
  };

  type Selectable<T> = KyselySelectable<T>;
  export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;

  export type Buffer = ColumnType<Uint8Array, Uint8Array, Uint8Array>;
  export type Int8 = ColumnType<number, bigint | number, bigint | number>;

  export type Json = JsonValue;

  export type JsonArray = JsonValue[];

  export type JsonObject = {
    [K in string]?: JsonValue;
  };
  export type ArrayType<T> = T[];
  export type JsonPrimitive = boolean | number | string | null;

  export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

  export type Numeric = ColumnType<number, number, number>;

  export type PgsodiumKeyStatus = "default" | "expired" | "invalid" | "valid";

  export type PgsodiumKeyType = "aead-det" | "aead-ietf" | "auth" | "generichash" | "hmacsha256" | "hmacsha512" | "kdf" | "secretbox" | "secretstream" | "shorthash" | "stream_xchacha20";

  export type Timestamp = ColumnType<Date, Date | string, Date | string>;


  const pure: Pure;
  const console: Console;
}
