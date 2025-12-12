import { auth } from "@/config/auth";
import { redirect } from "next/navigation";

import { AlertCircle, ChevronRight, CreditCard, FileText, MessageCircleQuestionMark, MessageSquareDot, MessagesSquare, Store, User } from "lucide-react";
import Link from "next/link";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import LogoutButtonDialog from "@/components/logout-button-dialog";
import ToggleSettingDarkMode from "@/components/toggle-setting-dark-mode";

export default async function OwnerSettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <h1 className="mb-2 font-semibold">Personal</h1>

      <Item variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/profil">
          <ItemMedia>
            <User className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Profil Anda</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Link>
      </Item>

      <Item variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/dashboard-kedai/pengaturan/pesan-singkat">
          <ItemMedia>
            <MessagesSquare className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Pesan Singkat</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Link>
      </Item>

      <LogoutButtonDialog />

      <h1 className="mt-4 mb-2 font-semibold">Pengaturan Kedai</h1>

      <Item variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/dashboard-kedai/pengaturan/edit-kedai">
          <ItemMedia>
            <Store className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Edit Data Kedai</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Link>
      </Item>

      <Item variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/dashboard-kedai/ulasan-pelanggan">
          <ItemMedia>
            <MessageSquareDot className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Ulasan Pelanggan</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Link>
      </Item>

      <Item variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/dashboard-kedai/metode-pembayaran">
          <ItemMedia>
            <CreditCard className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Metode Pembayaran</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Link>
      </Item>

      {/* <Item variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/dashboard-kedai/pengaturan/pesan-singkat">
          <ItemMedia>
            <IconBell className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Atur Notifikasi</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Link>
      </Item> */}

      <h1 className="mt-4 mb-2 font-semibold">Tentang Aplikasi</h1>

      <Item variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/kebijakan-dan-privasi">
          <ItemMedia>
            <FileText className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Kebijakan & Privasi</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Link>
      </Item>

      <ToggleSettingDarkMode />

      <Item variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/versi-aplikasi">
          <ItemMedia>
            <AlertCircle className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Versi Aplikasi</ItemTitle>
          </ItemContent>
          <ItemActions>
            <h1>1.0</h1>
          </ItemActions>
        </Link>
      </Item>

      <Item variant="outline" size="sm" className="mb-4" asChild>
        <Link href="/pusat-bantuan">
          <ItemMedia>
            <MessageCircleQuestionMark className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Pusat Bantuan</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Link>
      </Item>
    </div>
  );
}
