export function getImageUrl(path: string): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL + "/uploads" + path;
}
