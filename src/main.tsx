import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App";
import { PureVSCode } from "@/components/vscode-editor/pure-vscode";

await PureVSCode.instance.init().catch((e) => {
  console.error("Failed to initialize PureVSCode", e);
  throw e;
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
