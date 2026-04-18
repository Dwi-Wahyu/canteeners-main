import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mwozu5eodkq4uc39.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3002",
        pathname: "/uploads/**",
      },
    ],
    // Solusi untuk error "private ip":
    // Mematikan proteksi SSRF untuk localhost agar server bisa mendownload gambarnya sendiri
    dangerouslyAllowSVG: true,
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
