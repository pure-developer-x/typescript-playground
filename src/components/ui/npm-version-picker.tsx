import { dependenciesAtom, Dependency } from "@/atoms/dependency-atom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { HStack } from "@/components/ui/hstack";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSetAtom } from "jotai";
import { useState } from "react";

export function NpmVersionPicker({ dependency }: { dependency: Dependency }) {
  const name = dependency.name;

  const [, setFetchedPackage] = useState<string | null>(null);
  const [versions, setVersions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPrerelease, setShowPrerelease] = useState(false);
  const setDependencies = useSetAtom(dependenciesAtom);
  const [open, setOpen] = useState(false);

  const filteredVersions = versions.filter((v) => {
    if (showPrerelease) {
      return true;
    }

    return !/(-|alpha|beta|rc|next)/g.test(v);
  });

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="text-blue-500 text-xs px-1 h-2"
          onClick={() => {
            setIsLoading(true);
            setVersions([]);
            fetch(`https://registry.npmjs.org/${name}`)
              .then((res) => res.json())
              .then((data) => {
                setFetchedPackage(name);
                setVersions(
                  Object.keys(data.versions).sort((a, b) =>
                    a.localeCompare(b) ? -1 : 1
                  )
                );
              })
              .finally(() => {
                setIsLoading(false);
              });
          }}
        >
          {dependency.version}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-0 w-40">
        <Command shouldFilter={false}>
          <CommandInput className="h-8" placeholder={"Search version"} />
          <HStack className="ml-auto p-2">
            <Label
              htmlFor="prerelease-checkbox"
              className="text-xs text-muted-foreground"
            >
              Show prerelease versions
            </Label>
            <Checkbox
              id="prerelease-checkbox"
              checked={showPrerelease}
              onCheckedChange={(v) => setShowPrerelease(!!v)}
            ></Checkbox>
          </HStack>
          <Separator />
          <CommandList>
            <CommandEmpty>No versions found</CommandEmpty>
            {isLoading && (
              <CommandGroup>
                <CommandItem>
                  <Skeleton className="w-full h-6"></Skeleton>
                </CommandItem>
                <CommandItem>
                  <Skeleton className="w-full h-6"></Skeleton>
                </CommandItem>
                <CommandItem>
                  <Skeleton className="w-full h-6"></Skeleton>
                </CommandItem>
                <CommandItem>
                  <Skeleton className="w-full h-6"></Skeleton>
                </CommandItem>
              </CommandGroup>
            )}
            {filteredVersions.length > 0 && (
              <CommandGroup className="max-h-64 overflow-scroll scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-background">
                {filteredVersions.map((v) => (
                  <CommandItem
                    key={v}
                    onSelect={async () => {
                      setDependencies((deps) =>
                        deps.map((d) =>
                          d.name === dependency.name ? { ...d, version: v } : d
                        )
                      );
                      setOpen(false);
                    }}
                  >
                    {v}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
