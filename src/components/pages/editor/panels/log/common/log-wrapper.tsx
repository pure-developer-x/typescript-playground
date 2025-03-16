import { HStack } from "@/components/ui/hstack";

export function LogWrapper({ children }: React.PropsWithChildren) {
  return <HStack className="w-full relative">{children}</HStack>;
}
