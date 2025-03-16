/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PureInspectorTheme,
  PureNodeRenderer,
} from "@/components/ui/pure-inspector";
import { TableInspector } from "react-inspector";
import "./pure-table-inspector.css";

export function PureTableInspector(props: {
  data: unknown;
  columns?: string[];
}) {
  return (
    <div className="table-inspector">
      <TableInspector
        {...props}
        nodeRenderer={PureNodeRenderer}
        theme={PureInspectorTheme}
      />
    </div>
  );
}
