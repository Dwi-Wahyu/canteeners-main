"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { signIn, useSession } from "next-auth/react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { LoginSchema, LoginInput } from "@/features/auth/lib/auth-type";
import { useEffect } from "react";

export default function LoginKedaiPage() {
  const router = useRouter();

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

  const session = useSession();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/dashboard-kedai");
    }
  }, [session, session.status]);

  return (
    <div className="p-5">
      <Card className="mx-auto w-full md:max-w-md">
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    {...field}
                    id="username"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />

                  {fieldState.error?.message && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            form="login-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader className="animate-spin" /> Loading
              </>
            ) : (
              <>Login</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
