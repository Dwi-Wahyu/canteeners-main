import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Store, Bell, User, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { getImageUrl } from "@/helper/get-image-url";
import Image from "next/image";

export default function OwnerTopbar({
  shopName,
  avatar,
}: {
  shopName: string;
  avatar: string;
}) {
  function handleLogout() {
    signOut({
      redirectTo: "/login-kedai",
    });
  }

  return (
    <div className="justify-between px-5 py-3 shadow flex items-center z-50 fixed top-0 left-0 bg-card w-full">
      <div className="flex gap-2 items-center">
        <Image src={"/app-logo.svg"} width={32} height={32} alt="logo" />

        <div>
          <h1 className="font-medium">{shopName}</h1>
          <h1 className="text-sm">Dashboard Pemilik</h1>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar>
            <AvatarImage src={getImageUrl(avatar)} alt={shopName} />
            <AvatarFallback>
              {shopName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/dashboard-kedai/notifikasi">
            <DropdownMenuItem className="cursor-pointer">
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifikasi</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard-kedai/pengaturan/profile">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/dashboard-kedai/pengaturan">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Keluar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
