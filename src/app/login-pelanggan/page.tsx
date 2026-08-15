"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ContinueWithGoogle from "./continue-with-google";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { createGuestSession } from "@/helper/create-guest-session";
import { Loader2 } from "lucide-react";

export default function LoginPelangganPage() {
  const router = useRouter();
  const session = useSession();
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  useEffect(() => {
    if (
      session.status === "authenticated" &&
      session.data?.user?.username?.includes("@")
    ) {
      router.push("/kantin/kantin-kudapan");
    }
  }, [session, session.status, session.data?.user?.username, router]);

  async function handleGuestLogin() {
    setIsGuestLoading(true);
    try {
      const guestId = localStorage.getItem("guestId");
      const result = await createGuestSession({
        name: "Tamu",
        guestId: guestId || undefined,
      });

      if (result.userId) {
        localStorage.setItem("guestId", result.userId);
        // Gunakan window.location agar session benar-benar ke-refresh
        window.location.href = "/kantin/kantin-kudapan";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGuestLoading(false);
    }
  }

  return (
    <div
      className="h-svh w-full relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #eff4ff 50%, #dce9ff 100%)",
      }}
    >
      {/* Abstract Background Blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          left: "-10%",
          width: "70vw",
          height: "70vw",
          background:
            "radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0) 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-20%",
          right: "-10%",
          width: "80vw",
          height: "80vw",
          background:
            "radial-gradient(circle, rgba(214, 224, 243, 0.4) 0%, rgba(214, 224, 243, 0) 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      {/* 1. Header Area - Top Aligned */}
      <header className="w-full flex justify-center pt-8 md:pt-12 relative z-10 shrink-0">
        <Link
          href="/"
          className="flex flex-col items-center gap-4 text-center group transition-transform duration-300 hover:scale-105"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl">
            <Image
              src="/logo.png"
              alt="Canteeners Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1
            className="font-headline font-extrabold text-3xl md:text-4xl tracking-tighter"
            style={{ color: "#0b1c30" }}
          >
            Can<span style={{ color: "#b70011" }}>teeners</span>
          </h1>
        </Link>
      </header>

      {/* 2. Main Area - Center Aligned Card */}
      <main className="flex-1 flex flex-col justify-center items-center w-full max-w-md mx-auto px-6 relative z-10">
        <div
          className="w-full p-8 flex flex-col gap-4 relative overflow-hidden rounded-3xl"
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 32px 64px -12px rgba(11, 28, 48, 0.12)",
          }}
        >
          <div className="text-center mb-4">
            <h2
              className="font-headline font-bold text-2xl tracking-tight"
              style={{ color: "#0b1c30" }}
            >
              Selamat Datang
            </h2>
            <p className="font-body text-sm mt-1" style={{ color: "#555f6f" }}>
              Masuk untuk menikmati hidangan terbaik.
            </p>
          </div>

          <ContinueWithGoogle />

          <div className="relative flex items-center justify-center w-full my-1">
            <Separator className="absolute" />
            <span className="relative z-10 bg-white px-4 text-muted-foreground text-sm font-medium rounded-full">
              Atau
            </span>
          </div>

          <Button
            variant="default"
            disabled={isGuestLoading}
            className="w-full h-12 font-headline font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #b70011 0%, #dc2626 100%)",
              color: "#ffffff",
            }}
            onClick={handleGuestLogin}
          >
            {isGuestLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyiapkan...
              </span>
            ) : (
              "Lanjutkan Mode Tamu"
            )}
          </Button>
        </div>
      </main>

      {/* 3. Footer Spacer - To balance the vertical center of the Card */}
      <div
        className="h-28 md:h-36 shrink-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Copyright Text */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 md:left-auto md:translate-x-0 md:right-6 md:bottom-8 pointer-events-none select-none z-10">
        <p
          className="text-[10px] font-body font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-50 whitespace-nowrap"
          style={{
            color: "#0b1c30",
          }}
        >
          <span className="md:hidden">© 2025 Canteeners</span>
          <span
            className="hidden md:inline-block"
            style={{ writingMode: "vertical-rl" }}
          >
            © 2025 Canteeners — All Rights Reserved
          </span>
        </p>
      </div>
    </div>
  );
}
