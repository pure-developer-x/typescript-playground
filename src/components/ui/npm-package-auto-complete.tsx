import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useCallback } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { useAtom, useSetAtom } from "jotai";
import { dependenciesAtom } from "@/atoms/dependency-atom";
import { upsertBy } from "@/atoms/utils";
import { keyBy } from "lodash";

type NpmPackage = {
  name: string;
  version: string;
  description: string;
};

type NpmRegistryType = {
  objects: {
    package: NpmPackage;
  }[];
};

export function NpmPackageAutoComplete() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [packages, setPackages] = useState<NpmPackage[]>([]);
  const [dependencies, setDependencies] = useAtom(dependenciesAtom);

  const debouncedFetch = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (value) {
          fetch(`https://registry.npmjs.org/-/v1/search?text=${value}&size=10`)
            .then((res) => res.json())
            .then((data: NpmRegistryType) => {
              setPackages(
                data.objects.map((obj) => ({
                  name: obj.package.name,
                  version: obj.package.version,
                  description: obj.package.description,
                }))
              );
            });
        } else {
          setPackages([]);
        }
      }, 300);
    };
  }, []);

  const onInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      debouncedFetch(value);
    },
    [debouncedFetch]
  );

  const dependencyLookup = useMemo(
    () => keyBy(dependencies, (a) => a.name),
    [dependencies]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="xs"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          Import Package
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={"Search for a package..."}
            value={inputValue}
            onValueChange={onInputChange}
          />
          <CommandList>
            <CommandEmpty>No package found.</CommandEmpty>
            {packages.length > 0 && (
              <CommandGroup className="max-h-64 overflow-scroll scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-background">
                {packages.map((pkg) => (
                  <CommandItem
                    key={pkg.name}
                    disabled={Boolean(dependencyLookup[pkg.name])}
                    onSelect={async () => {
                      setDependencies((deps) =>
                        upsertBy(deps, (d) => d.name, {
                          name: pkg.name,
                          version: pkg.version,
                        })
                      );
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="flex justify-between">
                        <span>{pkg.name}</span>
                        <span className="text-muted-foreground">
                          {pkg.version}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {pkg.description}
                      </span>
                    </div>
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
