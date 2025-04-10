import { atomWithStorage } from "jotai/utils";

export type Dependency = {
  name: string;
  version: string;
};

export const dependenciesAtom = atomWithStorage<Dependency[]>(
  "dependencies",
  []
);
