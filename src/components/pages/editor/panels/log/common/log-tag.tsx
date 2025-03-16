import { cn } from "@/lib/utils";

export function LogTag({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <>
      <span
        className={cn(
          "text-[8px] bg-slate-600 px-2 rounded-full flex-shrink self-start mt-0.5 text-wrap",
          className
        )}
      >
        {children}
      </span>
      <div
        className={cn(
          "absolute w-[1px] h-[calc(100%-1rem)] left-4 bg-slate-700 -z-10",
          className
        )}
      ></div>
    </>
  );
}
