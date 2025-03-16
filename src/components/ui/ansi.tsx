import Convert from "ansi-to-html";

const convert = new Convert();

export function Ansi({ log }: { log: string }) {
  return (
    <pre
      className="text-xs"
      dangerouslySetInnerHTML={{ __html: convert.toHtml(log) }}
    />
  );
}
