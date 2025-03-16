import { Button } from "@/components/ui/button";
import { PlayIcon } from "@radix-ui/react-icons";
import { CompiledQuery } from "kysely";
import { createHighlighter } from "shiki";
import { format } from "sql-formatter";
import { selectInlinedSql } from "./selectors";
import { CollapsibleJSON } from "@/components/pages/editor/panels/log/common/collapsible-json";

const highlighter = await createHighlighter({
  themes: ["vitesse-dark"],
  langs: ["sql"],
});

export function ExecuteSqlButton({ compiled }: { compiled: CompiledQuery }) {
  const isPending = false;

  return (
    <Button
      size="md-icon"
      className="absolute top-0 right-0"
      variant="ghost"
      isLoading={isPending}
      onClick={async () => {
        console.log("executeSql", compiled);
      }}
    >
      <PlayIcon />
    </Button>
  );
}

export function SqlWrapper({ compiled }: { compiled: CompiledQuery }) {
  return (
    <div className="w-full h-full">
      <Sql sql={selectInlinedSql(compiled)} />
      <ExecuteSqlButton compiled={compiled} />
    </div>
  );
}

export function Sql({ sql }: { sql?: string }) {
  if (!sql) return null;

  let html = "";
  try {
    // Format SQL if it's longer than 50 characters
    const formattedSql =
      sql.length > 70
        ? format(sql, { language: "postgresql", tabWidth: 2 })
        : sql;
    html = highlighter.codeToHtml(formattedSql, {
      lang: "sql",
      theme: "vitesse-dark",
      colorReplacements: {
        "#121212": "240 10% 3.9%",
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
  return (
    <div
      className="text-xs px-2 py-1"
      dangerouslySetInnerHTML={{ __html: html }}
    ></div>
  );
}

export function QueryResult({ hash }: { hash: string }) {
  const sqlMocks = {} as Record<
    string,
    { value: { results: { rows: unknown[] } } }
  >;
  const queryResult = sqlMocks[hash]?.value.results.rows;

  // If there's no result yet, show a compact execution status
  if (!queryResult) {
    return (
      <div className="w-full px-2 py-0.5 text-xs text-muted-foreground bg-muted/30">
        <span className="flex items-center gap-1">
          <PlayIcon className="w-3 h-3" />
          Ready to execute
        </span>
      </div>
    );
  }

  return (
    <CollapsibleJSON label="Query Results" data={queryResult} defaultOpen />
  );
}
