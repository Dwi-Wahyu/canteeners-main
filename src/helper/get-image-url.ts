export function getImageUrl(path: string): string {
  // if (!path) return "/placeholder-image.webp"; // fallback jika path kosong

  // Memastikan path diawali dengan slash agar tidak terjadi double slash atau error path
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Karena sudah di-proxy oleh Nginx ke /uploads,
  return `/uploads${cleanPath}`;
}

// export function getImageUrl(path: string): string {
//   return process.env.NEXT_PUBLIC_BACKEND_URL + "/uploads" + path;
// }
