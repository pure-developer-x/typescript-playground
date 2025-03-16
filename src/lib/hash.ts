import { encode } from "base64-arraybuffer";

export async function hashObject<T>(input: T): Promise<string> {
  const arraybuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      typeof input !== "string" ? JSON.stringify(input) : input
    )
  );

  return encode(arraybuffer);
}
