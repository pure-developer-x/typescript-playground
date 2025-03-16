import { isUrl } from "@/lib/is-url";

// Parsed a scoped package name into name, version, and path.
const RE_SCOPED = /^(@[^/]+\/[^@/]+)(?:@([^/]+))?(\/.*)?$/;
// Parsed a non-scoped package name into name, version, path
const RE_NON_SCOPED = /^([^@/]+)(?:@([^/]+))?(\/.*)?$/;

export type NpmPackage = {
  /** The package name ie lodash, or @faker-js/faker */
  name: string;
  /**
   * The version of the package to use, default to 'latest'
   */
  version: string;
  /** Includes the (/) at the beginning  */
  path: string;
  type: "npm" | "http";
  /**
   * The domain of the package, if it's a type is http
   */
  domain?: string;
  /** The original input cleaned */
  original: string;
};

export function parsePackage(input: string): NpmPackage | undefined {
  let cleaned = input.trim();
  let type: NpmPackage["type"] = "npm";
  let domain;

  const urlParsed = tryParseUrl(cleaned);

  if (urlParsed) {
    cleaned = urlParsed.cleaned;
    domain = urlParsed.domain;
    type = urlParsed.type;
  }

  const npmParsed = tryParseNpm(cleaned);
  if (npmParsed) {
    cleaned = npmParsed.cleaned;
    type = npmParsed.type;
  }

  const m = RE_SCOPED.exec(cleaned) || RE_NON_SCOPED.exec(cleaned);

  if (!m) {
    return;
  }

  return {
    original: cleaned,
    name: m[1] || "",
    version: m[2] || "latest",
    path: m[3] || "",
    type,
    domain,
  };
}

function tryParseNpm(input: string) {
  if (input.startsWith("npm:")) {
    const cleaned = input.replace(/^npm:/, "");
    const type = "npm" as const;
    return {
      cleaned,
      type,
    };
  }
}

function tryParseUrl(input: string) {
  if (isUrl(input)) {
    const url = new URL(input);
    const domain = url.protocol + "//" + url.host;
    const cleaned = input.replace(new RegExp(`^${domain}/?`), "");
    const type = "http" as const;

    return {
      cleaned,
      domain,
      type,
    };
  }

  return undefined;
}
