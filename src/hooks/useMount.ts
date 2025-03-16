import { useEffect, useRef } from "react";

export function useMount(func: () => unknown) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    hasRun.current = true;
    func();
  }, [func]);
}
