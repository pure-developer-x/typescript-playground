import initSwc, {
  transformSync,
  // @ts-expect-error - From swc-wasm
} from "https://cdn.jsdelivr.net/npm/@swc/wasm-web@1.4.2/wasm-web.js";

export class PureCompiler {
  emptyExportRegex = /export \{\s*\};\s*$/;

  options = {
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: false,
      },
      target: "es2022",
      loose: false,
      minify: {
        compress: false,
        mangle: false,
      },
    },
    module: {
      type: "commonjs",
    },
    minify: false,
    isModule: true,
  };

  static async init() {
    await initSwc();
  }

  constructor(private source: string) { }

  public compile(): string {
    const raw = transformSync(this.source, this.options);
    const code = this.post_transform(raw.code);
    return code;
  }

  public post_transform(value: string): string {
    return value.trim().replace(this.emptyExportRegex, "");
  }
}
