import { createSelector } from "reselect";

type State = {
  sql: string;
  parameters: ReadonlyArray<unknown>;
};

// Base selectors
const selectSql = (state: State) => state.sql;
const selectParameters = (state: State) => state.parameters;

// Helper selector to convert a single parameter to SQL string
const selectParamToSqlString = createSelector(
  [(param: unknown) => param],
  (param): string => {
    if (param === null) {
      return "NULL";
    } else if (typeof param === "string") {
      return `'${param.replace(/'/g, "''")}'`;
    } else if (typeof param === "number") {
      return param.toString();
    } else if (typeof param === "boolean") {
      return param ? "TRUE" : "FALSE";
    } else if (param instanceof Date) {
      return toSafeIso(param);
    } else if (Array.isArray(param)) {
      return `ARRAY[${param
        .map((item) => {
          if (item === null) return "NULL";
          if (typeof item === "string") return `'${item.replace(/'/g, "''")}'`;
          return item;
        })
        .join(",")}]`;
    } else if (typeof param === "object") {
      return `'${JSON.stringify(param).replace(/'/g, "''")}'`;
    }
    return "NULL";
  }
);

function toSafeIso(param: Date) {
  try {
    return `'${param.toISOString()}'`;
  } catch (e) {
    return '<invalid date>';
  }
}

// Memoized selector for converting all parameters to SQL strings
const selectParameterStrings = createSelector(
  [selectParameters],
  (parameters): string[] => parameters.map(selectParamToSqlString)
);

// Final selector that combines SQL and parameters
export const selectInlinedSql = createSelector(
  [selectSql, selectParameterStrings],
  (sql, paramStrings): string => {
    if (paramStrings.length === 0) return sql;

    const chunks: string[] = [];
    let lastIndex = 0;
    const paramRegex = /\$(\d+)/g;
    let match: RegExpExecArray | null;

    while ((match = paramRegex.exec(sql)) !== null) {
      const paramNum = parseInt(match[1], 10);
      chunks.push(sql.slice(lastIndex, match.index));
      chunks.push(paramStrings[paramNum - 1]);
      lastIndex = match.index + match[0].length;
    }

    chunks.push(sql.slice(lastIndex));
    return chunks.join("");
  }
); 