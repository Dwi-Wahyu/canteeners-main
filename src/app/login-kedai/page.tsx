"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "nextjs-toploader/app";
import { Loader, Eye, EyeOff, Loader2 } from "lucide-react";
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
    <div className="min-h-svh flex flex-col items-center">
      {/* Mobile-first centered container for desktop */}
      <div className="w-full max-w-120 min-h-svh flex flex-col shadow-xl">
        {/* Header Section */}
        <div className="relative bg-primary h-75 w-full rounded-b-[60px] flex flex-col items-center justify-center text-white overflow-hidden shrink-0">
          {/* Background decoration circles could go here if needed, but keeping it simple first */}

          <div className="flex flex-col items-center z-10 gap-2 -mt-5">
            <Link href={"/"}>
              <div className="relative w-24 h-24 mb-2">
                <Image
                  src="/app-logo.svg"
                  alt="Canteeners Logo"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
            </Link>
            <h1 className="text-3xl font-bold tracking-wide">CANTEENERS</h1>
            <p className="text-sm font-medium opacity-90">Kantin Naik Level</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 px-8 pt-10 pb-6 flex flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Selamat Datang</h2>
            <h2 className="text-lg text-muted-foreground">
              Masukkan Akun Kedai Anda
            </h2>
          </div>

          <form
            id="login-form"
            className="flex flex-col gap-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                {...form.register("username")}
                className="h-12 px-4 focus:ring-primary focus:border-primary"
                placeholder="Masukkan username"
                autoComplete="off"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  className="h-12 pl-4 pr-12 focus:ring-primary focus:border-primary"
                  placeholder="*********"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-white"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me?
                </Label>
              </div>
              <Link
                href="#"
                className="text-sm font-semibold text-red-500 hover:text-red-600"
              >
                Forgot password
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="mt-4 h-12 w-full text-base font-semibold"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> Loading...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
