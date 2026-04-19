"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { LoginSchema, LoginInput } from "@/features/auth/types/auth-schemas";
import Image from "next/image";
import Link from "next/link";

export default function LoginKedaiPage() {
  const router = useRouter();
  const session = useSession();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    const res = await signIn("credentials", {
      username: data.username,
      password: data.password,
      isGuest: "false",
      name: "",
      firebaseUid: null,
      redirect: false,
    });

    if (res?.error) {
      form.setError("username", {
        type: "manual",
        message: "Username atau Password salah",
      });
      form.setError("password", {
        type: "manual",
        message: "Username atau Password salah",
      });
    } else {
      router.push("/dashboard-kedai");
    }
  }

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/dashboard-kedai");
    }
  }, [session, session.status]);

  return (
    <div
      className="min-h-svh relative overflow-hidden flex flex-col justify-center items-center"
      style={{ background: "linear-gradient(135deg, #f8f9ff 0%, #eff4ff 50%, #dce9ff 100%)" }}
    >
      {/* Abstract Background Blobs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "70vw",
          height: "70vw",
          background: "radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0) 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "80vw",
          height: "80vw",
          background: "radial-gradient(circle, rgba(214, 224, 243, 0.4) 0%, rgba(214, 224, 243, 0) 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      <main className="w-full max-w-md px-6 py-12 relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="mb-10 text-center w-full">
          <Link href="/" className="inline-flex flex-col items-center gap-1">
            <div className="relative w-16 h-16 mb-2">
              <Image
                src="/app-logo.svg"
                alt="Canteeners Logo"
                fill
                className="object-contain"
              />
            </div>
            <h1
              className="font-headline font-extrabold text-4xl tracking-tight"
              style={{ color: "#0b1c30" }}
            >
              Canteen<span style={{ color: "#b70011" }}>eers</span>
            </h1>
          </Link>
          <p className="font-body-inter text-sm mt-2" style={{ color: "#555f6f" }}>
            Portal Kedai — Kelola Usaha Anda
          </p>
        </div>

        {/* Glassmorphism Login Card */}
        <div
          className="w-full p-8 flex flex-col gap-6 relative overflow-hidden rounded-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 32px 64px -12px rgba(11, 28, 48, 0.08)",
          }}
        >
          {/* Card Header */}
          <div className="text-center mb-2">
            {/* Kedai Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{
              background: "rgba(183, 0, 17, 0.08)",
            }}>
              <span className="text-xs font-semibold font-headline" style={{ color: "#b70011" }}>
                🏪 Akun Kedai
              </span>
            </div>
            <h2
              className="font-headline font-bold text-2xl tracking-tight"
              style={{ color: "#0b1c30" }}
            >
              Selamat Datang Kembali
            </h2>
            <p className="font-body-inter text-sm mt-1" style={{ color: "#555f6f" }}>
              Masukkan akun kedai Anda untuk melanjutkan.
            </p>
          </div>

          {/* Form */}
          <form
            id="login-kedai-form"
            className="flex flex-col gap-5 w-full"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-sm font-semibold ml-1 font-headline"
                style={{ color: "#0b1c30" }}
              >
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: "#555f6f" }}
                />
                <input
                  id="username"
                  type="text"
                  placeholder="username kedai"
                  autoComplete="off"
                  aria-invalid={!!form.formState.errors.username}
                  {...form.register("username")}
                  className="w-full rounded-xl py-3.5 pl-12 pr-4 text-sm transition-all duration-200"
                  style={{
                    background: "#ffffff",
                    border: form.formState.errors.username
                      ? "1px solid #ba1a1a"
                      : "1px solid rgba(230, 189, 184, 0.3)",
                    color: "#0b1c30",
                    outline: "none",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={(e) => {
                    if (!form.formState.errors.username) {
                      e.currentTarget.style.borderColor = "#b70011";
                      e.currentTarget.style.boxShadow = "0 0 0 4px rgba(183, 0, 17, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    if (!form.formState.errors.username) {
                      e.currentTarget.style.borderColor = "rgba(230, 189, 184, 0.3)";
                    }
                  }}
                />
              </div>
              {form.formState.errors.username?.message && (
                <p className="text-xs ml-1" style={{ color: "#ba1a1a" }}>
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold font-headline"
                  style={{ color: "#0b1c30" }}
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-semibold transition-colors font-headline"
                  style={{ color: "#b70011" }}
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: "#555f6f" }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="off"
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register("password")}
                  className="w-full rounded-xl py-3.5 pl-12 pr-12 text-sm transition-all duration-200"
                  style={{
                    background: "#ffffff",
                    border: form.formState.errors.password
                      ? "1px solid #ba1a1a"
                      : "1px solid rgba(230, 189, 184, 0.3)",
                    color: "#0b1c30",
                    outline: "none",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={(e) => {
                    if (!form.formState.errors.password) {
                      e.currentTarget.style.borderColor = "#b70011";
                      e.currentTarget.style.boxShadow = "0 0 0 4px rgba(183, 0, 17, 0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    if (!form.formState.errors.password) {
                      e.currentTarget.style.borderColor = "rgba(230, 189, 184, 0.3)";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#555f6f" }}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {form.formState.errors.password?.message && (
                <p className="text-xs ml-1" style={{ color: "#ba1a1a" }}>
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              form="login-kedai-form"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-full py-4 mt-2 font-headline font-bold text-base tracking-wide text-white transition-all duration-300 disabled:opacity-70"
              style={{
                background: "linear-gradient(135deg, #b70011 0%, #dc2626 100%)",
                boxShadow: "0 8px 24px -4px rgba(183, 0, 17, 0.25)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 12px 32px -4px rgba(183, 0, 17, 0.35)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 8px 24px -4px rgba(183, 0, 17, 0.25)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memuat...
                </span>
              ) : (
                "Masuk ke Kedai"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-2">
            <div className="h-px flex-1" style={{ background: "#d3e4fe" }} />
            <span
              className="font-headline text-xs font-medium uppercase tracking-widest"
              style={{ color: "#555f6f" }}
            >
              Atau
            </span>
            <div className="h-px flex-1" style={{ background: "#d3e4fe" }} />
          </div>

          {/* Switch to Pelanggan */}
          <Link
            href="/login-pelanggan"
            className="w-full rounded-full py-3.5 flex items-center justify-center gap-3 transition-all duration-200 font-headline font-semibold text-sm"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(230, 189, 184, 0.2)",
              color: "#0b1c30",
              boxShadow: "0 1px 4px rgba(11, 28, 48, 0.05)",
            }}
          >
            <span>🧑‍🍽️</span>
            <span>Masuk sebagai Pelanggan</span>
          </Link>
        </div>

        {/* Footer Link */}
        <p className="font-body-inter text-sm mt-8 text-center" style={{ color: "#555f6f" }}>
          Ingin bergabung sebagai mitra?{" "}
          <Link
            href="/mitra"
            className="font-headline font-bold transition-colors"
            style={{ color: "#b70011" }}
          >
            Daftar Mitra
          </Link>
        </p>
      </main>
    </div>
  );
}
