import { auth } from "@/config/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageUrl } from "@/helper/get-image-url";
import {
  BadgeCheck,
  User,
  Clock,
  Smartphone,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import ChangePasswordForm from "@/features/user/ui/change-password-form";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user.id) return null;

  const userDetail = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      fcm_tokens: {
        orderBy: { last_used_at: "desc" },
        take: 3,
      },
    },
  });

  if (!userDetail) return null;

  return (
    <div className="max-w-4xl p-6 mx-auto space-y-6 pb-10">
      <Link
        href={"/dashboard-kedai/pengaturan"}
        className="flex gap-1 text-muted-foreground text-sm items-center"
      >
        <ChevronLeft className="w-4 h-4" /> Kembali
      </Link>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Profil Saya</h2>
        <p className="text-muted-foreground">
          Kelola informasi publik dan kredensial akun Anda.
        </p>
      </div>

      <Card className="overflow-hidden border pt-0 shadow-sm">
        <div className="h-32 md:h-48 w-full bg-linear-to-r from-red-600 via-red-500 to-orange-500 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        <CardContent className="relative pt-0 sm:px-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:-mt-16 -mt-12 mb-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-background shadow-xl">
              <AvatarImage
                src={getImageUrl("/avatar/" + session.user.avatar)}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl bg-muted font-bold text-muted-foreground">
                {session.user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1 pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {session.user.name}
                </h3>
                <BadgeCheck className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-muted-foreground font-medium">
                {session.user.username}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="shadow-sm border">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                Riwayat Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-sm font-medium">Terakhir Login</p>
                  <p className="text-xs text-muted-foreground">
                    {userDetail.last_login
                      ? format(userDetail.last_login, "d MMMM yyyy, HH:mm", {
                          locale: idLocale,
                        })
                      : "Belum pernah login"}
                  </p>
                </div>
              </div>

              {userDetail.fcm_tokens.length > 0 && (
                <div className="space-y-3 pt-2 border-t">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Perangkat Terdaftar
                  </p>
                  {userDetail.fcm_tokens.map((token) => (
                    <div key={token.id} className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {token.platform} - {token.browser || "Aplikasi"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Terakhir aktif:{" "}
                          {token.last_used_at
                            ? format(token.last_used_at, "d MMM yyyy", {
                                locale: idLocale,
                              })
                            : "Tidak aktif"}
                        </p>
                      </div>
                      {token.is_active && (
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border h-fit">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-600 dark:text-red-400" />
              Keamanan Akun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="font-medium mb-1">Ubah Kata Sandi</h4>
              <p className="text-sm text-muted-foreground">
                Perbarui kata sandi Anda secara berkala untuk menjaga keamanan
                akun.
              </p>
            </div>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
