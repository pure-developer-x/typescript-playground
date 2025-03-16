import {
  FetchInput,
  Methods,
  PureMockExplicit,
} from "@/@types/resources";
import { EvaluationContext } from "@/components/hooks/useEvalContext";
import { hashObject } from "@/lib/hash";
import { PureLogger } from "@/workers/pure-logger";

/**
 * A mock fetch class for simulating fetch operations with the ability to inject custom responses.
 */
export class MockPureFetch {
  constructor(private context: EvaluationContext) { }

  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const requestDetails = this.parseRequestDetails(input, init);
    const hash = await hashObject(requestDetails);
    PureLogger.instance.send({
      type: "fetch",
      request: requestDetails,
      hash,
    });
    return this.createResponse(hash);
  }

  /**
   * Parses the input and init parameters to construct the request details.
   * @param input The resource that you wish to fetch.
   * @param init An options object containing any custom settings that you want to apply to the request.
   * @returns The parsed request details.
   */
  private parseRequestDetails(
    input: RequestInfo | URL,
    init?: RequestInit
  ): FetchInput {
    let url: URL;
    let method: string;
    let headers: Record<string, string> = {};
    let body: unknown;

    if (input instanceof URL) {
      url = input;
      method = init?.method || "GET";
      headers = init?.headers ? this.parseHeaders(init.headers) : {};
      body = init?.body || null;
    } else if (typeof input === "string") {
      url = new URL(input);
      method = init?.method || "GET";
      headers = init?.headers ? this.parseHeaders(init.headers) : {};
      body = init?.body || null;
    } else {
      url = new URL(input.url);
      method = input.method || "GET";
      headers = input.headers ? this.parseHeaders(input.headers) : {};
      body = input.body || null;
    }

    const isBodyJson =
      !headers["content-type"] ||
      headers["content-type"] === "application/json";
    if (isBodyJson && typeof body === "string") {
      body = JSON.parse(body);
    }

    return {
      url: url.toString(),
      method: method as Methods,
      headers,
      body,
    };
  }

  private parseHeaders(
    headers: HeadersInit | undefined
  ): Record<string, string> {
    if (!headers) {
      return {};
    }

    if (headers instanceof Headers) {
      return Array.from(headers.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
    } else if (Array.isArray(headers)) {
      return headers.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
    } else {
      return headers;
    }
  }

  /**
   * Creates a simulated JSON response.
   * @returns A simulated response object.
   */
  private async createResponse(
    hashedInput: string
  ): Promise<Response> {
    // Have we taken a sample of this request?
    if (this.context.fetchMocks[hashedInput]) {
      const mock = this.context.fetchMocks[hashedInput];
      const mockedResponse = mock.value.response;

      const responseBody = this.parseInBoundBody(mock);
      const responseHeaders = new Headers(
        Object.entries(mockedResponse.headers)
      );
      const response = new Response(responseBody, {
        status: mockedResponse.status,
        statusText: mockedResponse.statusText,
        headers: responseHeaders,
      });

      return response;
    }


    return new Response(JSON.stringify({ easter: "egg" }), {
      status: 599,
      statusText: "Pure Status: Inbound request not found.",
    });
  }

  private parseInBoundBody(mock: PureMockExplicit<'fetch'>) {
    const response = mock.value.response;
    switch (response.type) {
      case "json":
        return JSON.stringify(response.body);
      case "form":
        return new URLSearchParams(
          Object.entries(response.body)
        ).toString();
      case "text":
        return response.body;
      case "binary":
        return response.body;
      case "none":
        return null;
    }
  }
}
