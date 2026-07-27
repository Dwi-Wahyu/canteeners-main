import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.11",
    "*.192.168.1.11",
    "localhost",
    "10.255.177.38",
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  images: {
    qualities: [75, 85],
    // Mengizinkan Next.js mengakses localhost untuk optimasi gambar
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
      {
        protocol: "http",
        hostname: "10.255.177.38",
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
