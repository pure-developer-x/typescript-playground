import { useAtom } from "jotai";

import { Button } from "@/components/ui/button";
import { PlayIcon } from "@radix-ui/react-icons";
import {
  executeFetchAtom,
  FetchInputType,
} from "@/components/pages/editor/panels/log/fetch-log";

export function ExecuteFetchButton({ request }: { request: FetchInputType }) {
  const [{ mutateAsync: executeSql, isPending }] = useAtom(executeFetchAtom);

  return (
    <Button
      size="md-icon"
      className="absolute top-0 right-0"
      variant="ghost"
      isLoading={isPending}
      onClick={async () => {
        executeSql(request);
      }}
    >
      <PlayIcon />
    </Button>
  );
}
