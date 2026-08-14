import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Canteeners - Pesan Makanan Kantin Mudah dan Cepat",
  description:
    "Lewati antrean, nikmati makananmu. Platform pemesanan makanan kampus #1 yang menghubungkan mahasiswa dengan kantin favorit mereka.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon1.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Canteeners" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="antialiased">
        <NextTopLoader
          color="#DC2626"
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
