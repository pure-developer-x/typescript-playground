import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import pkg from "./package.json" assert { type: "json" };
import * as fs from "fs";
import type { Plugin } from 'esbuild'
import url from 'url'
import { resolve } from 'import-meta-resolve'

const localDependencies = Object.entries(pkg.dependencies)
  .filter(([name]) => name.startsWith("@codingame"))
  .filter(
    ([name]) => !name.includes("@codingame/monaco-vscode-rollup-vsix-plugin")
  )
  .map(([name]) => name);

export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: ['jotai/babel/preset'],
        "plugins": [
          ['@babel/plugin-syntax-import-attributes', { deprecatedAssertSyntax: true }]
        ],

      },
    }),
    {
      // For the *-language-features extensions which use SharedArrayBuffer
      name: "configure-response-headers",
      apply: "serve",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

          next();
        });
      },

    },
    {
      name: "force-prevent-transform-assets",
      apply: "serve",
      configureServer(server) {
        return () => {
          server.middlewares.use(async (req, res, next) => {
            if (req.originalUrl != null) {
              const pathname = new URL(req.originalUrl, import.meta.url)
                .pathname;
              if (pathname.endsWith(".html")) {
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.write(fs.readFileSync(path.join(__dirname, pathname)));
                res.end();
              }
            }

            next();
          });
        };
      },
    },
  ],
  optimizeDeps: {
    // This is require because vite excludes local dependencies from being optimized
    // Monaco-vscode-api packages are local dependencies and the number of modules makes chrome hang
    include: [
      // add all local dependencies...
      ...localDependencies,
      // and their exports
      "vscode/extensions",
      "vscode/services",
      "vscode/monaco",
      "vscode/localExtensionHost",

      // These 2 lines prevent vite from reloading the whole page when starting a worker (so 2 times in a row after cleaning the vite cache - for the editor then the textmate workers)
      // it's mainly empirical and probably not the best way, fix me if you find a better way
      "vscode-textmate",
      "vscode-oniguruma",
      "@vscode/vscode-languagedetection",
    ],
    exclude: [],
    esbuildOptions: {
      tsconfig: "./tsconfig.json",
      // @ts-ignore
      plugins: [importMetaUrlPlugin()],
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    format: "es",
  },
  esbuild: {
    supported: {
      'top-level-await': true
    }
  },
  preview: {
    port: 5173,
  }
});



function importMetaUrlPlugin(): Plugin {
  return {
    name: 'import.meta.url',
    setup({ onLoad }) {
      // Help vite that bundles/move files in dev mode without touching `import.meta.url` which breaks asset urls
      onLoad({ filter: /@codingame\/.*\.js$/, namespace: 'file' }, async args => {
        const code = fs.readFileSync(args.path, 'utf8')

        const assetImportMetaUrlRE = /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g
        let i = 0
        let newCode = ''
        for (let match = assetImportMetaUrlRE.exec(code); match != null; match = assetImportMetaUrlRE.exec(code)) {
          newCode += code.slice(i, match.index)

          const path = match[1]!.slice(1, -1)
          const resolved = resolve!(path, url.pathToFileURL(args.path).toString())

          newCode += `new URL(${JSON.stringify(url.fileURLToPath(resolved))}, import.meta.url)`

          i = assetImportMetaUrlRE.lastIndex
        }
        newCode += code.slice(i)

        return { contents: newCode }
      })
    }
  }
}


