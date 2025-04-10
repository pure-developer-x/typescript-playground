import { dependenciesAtom } from "@/atoms/dependency-atom";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { NpmPackageAutoComplete } from "@/components/ui/npm-package-auto-complete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAtomValue } from "jotai";
import { HelpCircleIcon, ListIcon } from "lucide-react";
import { PackageList } from "./package-list";
import { useSyncPackageJson } from "@/hooks/use-sync-package-json";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NpmModules() {
  const dependencies = useAtomValue(dependenciesAtom);
  useSyncPackageJson();

  return (
    <HStack className="border-b py-2 px-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="xs"
            disabled={dependencies.length === 0}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <PackageList />
        </PopoverContent>
      </Popover>
      <NpmPackageAutoComplete />
      <Tooltip>
        <TooltipTrigger>
          <HelpCircleIcon className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          Import a NPM package to use in your code. Once imported you will be
          able to use it in your code. Note after importing a package you need
          to restart the page in order to install the types. This is being
          worked on.
        </TooltipContent>
      </Tooltip>
    </HStack>
  );
}
