import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NextTopLoader from "nextjs-toploader";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Canteeners - Pesan Makanan Kantin Mudah dan Cepat",
  description:
    "Lewati antrean, nikmati makananmu. Platform pemesanan makanan kampus #1 yang menghubungkan mahasiswa dengan kantin favorit mereka.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={`${poppins.variable} ${plusJakartaSans.variable} ${inter.variable} antialiased`}
      >
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
