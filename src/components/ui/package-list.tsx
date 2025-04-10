import { dependenciesAtom } from "@/atoms/dependency-atom";
import { useAtomValue, useSetAtom } from "jotai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NpmVersionPicker } from "@/components/ui/npm-version-picker";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PackageList() {
  const dependencies = useAtomValue(dependenciesAtom);
  const setDependencies = useSetAtom(dependenciesAtom);

  const handleDelete = (packageName: string) => {
    setDependencies((prev) => prev.filter((pkg) => pkg.name !== packageName));
  };

  if (dependencies.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No packages added yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px] p-2">
      <div className="space-y-2">
        {dependencies.map((pkg) => (
          <div
            key={pkg.name}
            className="flex items-center justify-between rounded-md border px-2 py-1"
          >
            <span className="text-sm font-medium">{pkg.name}</span>
            <div className="flex items-center gap-2">
              <NpmVersionPicker dependency={pkg} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Package</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {pkg.name}? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(pkg.name)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
