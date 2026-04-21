import { auth } from "@/config/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageUrl } from "@/helper/get-image-url";
import { BadgeCheck, Store, Shield, User as UserIcon } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Profil Saya</h2>
        <p className="text-muted-foreground">Kelola informasi publik dan kredensial akun Anda.</p>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="h-32 md:h-48 w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-500 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        <CardContent className="relative px-6 pb-6 pt-0 sm:px-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:-mt-16 -mt-12 mb-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-background shadow-xl">
              <AvatarImage src={getImageUrl("/avatar/" + session.user.avatar)} className="object-cover" />
              <AvatarFallback className="text-4xl bg-muted font-bold text-muted-foreground">
                {session.user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1 pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{session.user.name}</h3>
                <BadgeCheck className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-muted-foreground font-medium">{session.user.username}</p>
            </div>
            <div className="pb-3 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto flex justify-center sm:justify-start">
               <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-4 py-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
                 <Shield className="h-4 w-4" />
                 <span className="capitalize">{session.user.role.toLowerCase().replace("_", " ")}</span>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="grid gap-1.5">
              <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
              <p className="font-semibold">{session.user.name}</p>
            </div>
            <div className="grid gap-1.5">
              <p className="text-sm font-medium text-muted-foreground">Username / Email</p>
              <p className="font-semibold">{session.user.username}</p>
            </div>
            <div className="grid gap-1.5">
              <p className="text-sm font-medium text-muted-foreground">ID Pengguna</p>
              <p className="font-mono text-xs sm:text-sm bg-muted p-2 rounded-md inline-block w-fit text-muted-foreground break-all">{session.user.id}</p>
            </div>
          </CardContent>
        </Card>

        {session.user.shopName && (
          <Card className="shadow-sm border">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="h-5 w-5 text-red-600 dark:text-red-400" />
                Informasi Kedai
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid gap-1.5">
                <p className="text-sm font-medium text-muted-foreground">Nama Kedai</p>
                <p className="font-semibold">{session.user.shopName}</p>
              </div>
              <div className="grid gap-1.5">
                <p className="text-sm font-medium text-muted-foreground">ID Kedai</p>
                <p className="font-mono text-xs sm:text-sm bg-muted p-2 rounded-md inline-block w-fit text-muted-foreground break-all">{session.user.shopId}</p>
              </div>
               <div className="grid gap-1.5">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="font-semibold">Pemilik Utama</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
