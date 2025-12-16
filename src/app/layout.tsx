import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";
import NotificationDialog from "@/components/notification-dialog";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Canteeners",
  description: "Kantin Naik Level",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable}  antialiased`}>
        <NextTopLoader
          color="#2e7d32"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          easing="ease"
          speed={200}
          zIndex={1600}
          showAtBottom={false}
          showSpinner={false}
        />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
