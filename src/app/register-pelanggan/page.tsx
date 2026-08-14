"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { RegisterSchema, RegisterInput } from "@/features/auth/types/auth-schemas";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { registerCustomer } from "@/features/auth/lib/auth-actions";
import { toast } from "sonner";
import ContinueWithGoogle from "../login-pelanggan/continue-with-google";

export default function RegisterPelangganPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: RegisterInput) {
    try {
      const localUid = crypto.randomUUID();

      // 2. Register to our database
      const res = await registerCustomer({
        ...data,
        firebaseUid: localUid,
      });

      if (!res.success) {
        toast.error(res.error.message);
        return;
      }

      toast.success("Registrasi berhasil! Silakan masuk.");

      // 3. Auto login after registration
      const loginRes = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login-pelanggan");
      } else {
        router.push("/kantin");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.code === "auth/email-already-in-use") {
        form.setError("username", { message: "Email/Username sudah digunakan" });
      } else {
        toast.error("Terjadi kesalahan saat mendaftar");
      }
    }
  }

  const session = useSession();

  useEffect(() => {
    if (session.status === "authenticated" && session.data?.user?.username !== "") {
      router.push("/kantin");
    }
  }, [session, session.status, session.data?.user?.username, router]);

  return (
    <div
      className="min-h-svh relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #eff4ff 50%, #dce9ff 100%)",
      }}
    >
      {/* Abstract Background Blobs */}
      <div
        style={{
          position: "absolute",
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
        style={{
          position: "absolute",
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

      {/* Brand Header */}
      <header className="md:relative absolute top-0 left-0 w-full pt-10 px-6 z-20 text-center pointer-events-none">
        <Link
          href="/"
          className="inline-flex flex-row items-center gap-3 pointer-events-auto"
        >
          <div className="relative w-10 h-10">
            <Image
              src="/app-logo.svg"
              alt="Canteeners Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1
            className="font-headline font-extrabold text-2xl md:text-3xl tracking-tight"
            style={{ color: "#0b1c30" }}
          >
            Can<span style={{ color: "#b70011" }}>teen</span>eers
          </h1>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center w-full max-w-md mx-auto px-6 py-8 relative z-10">
        {/* Glassmorphism Register Card */}
        <div
          className="w-full p-8 flex flex-col gap-4 relative overflow-hidden rounded-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 32px 64px -12px rgba(11, 28, 48, 0.08)",
          }}
        >
          <div className="text-center mb-2">
            <h2
              className="font-headline font-bold text-2xl tracking-tight"
              style={{ color: "#0b1c30" }}
            >
              Daftar Akun
            </h2>
            <p className="font-body text-sm mt-1" style={{ color: "#555f6f" }}>
              Buat akun untuk mulai memesan makanan.
            </p>
          </div>

          {/* Form */}
          <form
            id="register-pelanggan-form"
            className="flex flex-col gap-4 w-full"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold ml-1 font-headline"
                    style={{ color: "#0b1c30" }}
                  >
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: "#555f6f" }}
                    />
                    <input
                      {...field}
                      id="name"
                      type="text"
                      placeholder="nama lengkap anda"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      className="w-full rounded-xl py-3 pl-12 pr-4 text-sm transition-all duration-200"
                      style={{
                        background: "#ffffff",
                        border: fieldState.invalid
                          ? "1px solid #ba1a1a"
                          : "1px solid rgba(230, 189, 184, 0.3)",
                        color: "#0b1c30",
                        outline: "none",
                        fontFamily: "Inter, sans-serif",
                      }}
                    />
                  </div>
                  {fieldState.error?.message && (
                    <p className="text-xs ml-1" style={{ color: "#ba1a1a" }}>
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Username Field */}
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="username"
                    className="text-sm font-semibold ml-1 font-headline"
                    style={{ color: "#0b1c30" }}
                  >
                    Username / Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: "#555f6f" }}
                    />
                    <input
                      {...field}
                      id="username"
                      type="text"
                      placeholder="username atau email anda"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      className="w-full rounded-xl py-3 pl-12 pr-4 text-sm transition-all duration-200"
                      style={{
                        background: "#ffffff",
                        border: fieldState.invalid
                          ? "1px solid #ba1a1a"
                          : "1px solid rgba(230, 189, 184, 0.3)",
                        color: "#0b1c30",
                        outline: "none",
                        fontFamily: "Inter, sans-serif",
                      }}
                    />
                  </div>
                  {fieldState.error?.message && (
                    <p className="text-xs ml-1" style={{ color: "#ba1a1a" }}>
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold ml-1 font-headline"
                    style={{ color: "#0b1c30" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: "#555f6f" }}
                    />
                    <input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="min. 8 karakter"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      className="w-full rounded-xl py-3 pl-12 pr-12 text-sm transition-all duration-200"
                      style={{
                        background: "#ffffff",
                        border: fieldState.invalid
                          ? "1px solid #ba1a1a"
                          : "1px solid rgba(230, 189, 184, 0.3)",
                        color: "#0b1c30",
                        outline: "none",
                        fontFamily: "Inter, sans-serif",
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
                  {fieldState.error?.message && (
                    <p className="text-xs ml-1" style={{ color: "#ba1a1a" }}>
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Submit Button */}
            <button
              type="submit"
              form="register-pelanggan-form"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-full py-4 font-headline font-bold text-base tracking-wide text-white transition-all duration-300 disabled:opacity-70 mt-2"
              style={{
                background: "linear-gradient(135deg, #b70011 0%, #dc2626 100%)",
                boxShadow: "0 8px 24px -4px rgba(183, 0, 17, 0.25)",
              }}
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mendaftar...
                </span>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          <ContinueWithGoogle />

          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Sudah punya akun?{" "}
              <Link
                href="/login-pelanggan"
                className="font-bold text-primary hover:underline"
              >
                Masuk Sekarang
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Visual Spacer */}
      <div
        className="hidden md:block h-32 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
