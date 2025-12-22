import { auth } from "@/config/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageUrl } from "@/helper/get-image-url";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Profil Saya</h2>
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={getImageUrl(session.user.avatar)} />
            <AvatarFallback>
              {session.user.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{session.user.name}</h3>
            <p className="text-muted-foreground">{session.user.username}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {session.user.role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
