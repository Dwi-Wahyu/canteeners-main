export function truncateString({
  string,
  maxChars = 25,
}: {
  string: string;
  maxChars?: number;
}) {
  return string.length > maxChars ? string.slice(0, maxChars) + "..." : string;
}
