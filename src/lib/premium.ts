import { readStorage, writeStorage } from "@/lib/storage";

export const PREMIUM_KEY = "smr-parent-premium";

export function isPremium() {
  return readStorage(PREMIUM_KEY) === "1";
}

export function setPremium(on: boolean) {
  writeStorage(PREMIUM_KEY, on ? "1" : "0");
}
