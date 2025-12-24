import { BAD_WORDS } from "./bad-words";

export function containsBadWords(text: string): boolean {
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, "");

  return BAD_WORDS.some((word) => normalized.includes(word));
}
