import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      new URL("https://mwozu5eodkq4uc39.public.blob.vercel-storage.com/**"),
    ],
  },
};

export default nextConfig;
