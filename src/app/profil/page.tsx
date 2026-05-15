"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/helper/get-image-url";
import {
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Gavel,
  ShieldAlert,
  Bell,
} from "lucide-react";
import { BottomNav } from "@/components/layouts/bottom-nav";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCustomerReferralStatus,
  getCustomerSuspensionStatus,
} from "@/features/user/lib/user-queries";
import { activateReferralCode } from "@/features/user/lib/user-actions";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ReferralStatusCard from "@/features/user/ui/referral-status-card";
import UserVouchersSection from "@/features/user/ui/user-vouchers-section";
import { Badge } from "@/components/ui/badge";

export default function CustomerProfilePage() {
  const { data: session, status } = useSession();
  const [referralStatus, setReferralStatus] = useState<{
    referral_code: string | null;
    completed_orders_count: number;
    is_eligible: boolean;
    referral_usage_count: number;
    vouchers: any[];
  } | null>(null);
  const [suspensionStatus, setSuspensionStatus] = useState<{
    suspend_until: Date | null;
    suspend_reason: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, session?.user?.name, session?.user?.username]);

  const fetchStatus = async () => {
    try {
      const id = session!.user.id;

      // Fetch suspension status for all logged-in users
      const suspension = await getCustomerSuspensionStatus(id);
      setSuspensionStatus(suspension);

      // Only fetch referral status if profile is complete
      if (session?.user?.name && session?.user?.username) {
        const status = await getCustomerReferralStatus(id);
        setReferralStatus(status as any);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isSuspended =
    suspensionStatus?.suspend_until &&
    new Date(suspensionStatus.suspend_until) > new Date();

  const handleActivate = async () => {
    setIsActivating(true);
    const res = await activateReferralCode();
    setIsActivating(false);

    if (res.success) {
      // toast.success(res.message);
      fetchStatus();
    } else {
      toast.error(res.error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kode referral berhasil disalin!");
  };

  // 1. Loading State (Skeleton)
  if (status === "loading" || (session?.user?.id && loading)) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="bg-white border-b pb-8 px-5 pt-5">
          <div className="max-w-md mx-auto flex flex-col items-center text-center">
            <Skeleton className="size-24 rounded-full mb-4" />
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="max-w-md mx-auto mt-8 px-5 space-y-4">
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="bg-white rounded-2xl border p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="size-4" />
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // 2. Guest Mode Detection (No session OR missing identity fields)
  const isGuest = !session || !session.user?.name || !session.user?.username;

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header Profile Guest */}
        <div className="bg-white border-b pb-10 px-5 pt-12">
          <div className="max-w-md mx-auto flex flex-col items-center text-center">
            <div className="relative mb-6">
              <Avatar className="size-24 border-4 border-white shadow-xl">
                <AvatarFallback className="bg-gray-100 text-muted-foreground">
                  <User className="size-12" />
                </AvatarFallback>
              </Avatar>
              {isSuspended && (
                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-2 border-white shadow-lg animate-pulse">
                  <ShieldAlert className="size-4" />
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Halo, {session?.user?.name || "Tamu"}!
            </h1>
            {isSuspended && (
              <Badge variant="destructive" className="mb-4 font-bold px-4 py-1">
                Akun Dibekukan
              </Badge>
            )}
            {!isSuspended && session?.user?.name && (
              <p className="text-xs font-medium text-orange-600 mb-2">
                Anda sedang dalam mode tamu
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-8 max-w-[250px]">
              {isSuspended
                ? "Akun Anda sedang ditangguhkan. Silakan cek detail pelanggaran Anda."
                : "Masuk untuk menikmati fitur lengkap, kelola pesanan, dan dapatkan promo menarik."}
            </p>
            {!isSuspended && (
              <Button
                asChild
                className="rounded-full px-10 h-12 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                <Link href="/login-pelanggan">Masuk Sekarang</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Guest Menu Information */}
        <div className="max-w-md mx-auto mt-8 px-5 space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
            Menu & Informasi
          </h2>
          <div className="bg-white rounded-xl shadow border border-muted overflow-hidden">
            {session && (
              <>
                <Link
                  href="/profil/pelanggaran"
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
                >
                  <div className="p-2 bg-red-50 rounded-xl">
                    <Gavel className="size-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Pelanggaran
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Cek status akun & riwayat pelanggaran
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSuspended && (
                      <Badge variant="destructive" className="text-[8px] h-4">
                        DIBLOKIR
                      </Badge>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>

                <Link
                  href="/notifikasi"
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
                >
                  <div className="p-2 bg-orange-50 rounded-xl">
                    <Bell className="size-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Notifikasi
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Lihat pembaruan pesanan & laporan
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </>
            )}
            <Link
              href="/kebijakan-dan-privasi?back_url=/profil"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
            >
              <div className="p-2 bg-purple-50 rounded-xl">
                <ShieldCheck className="size-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Kebijakan Privasi
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Pelajari bagaimana kami menjaga data Anda
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href="/syarat-dan-ketentuan/pelanggan?back_url=/profil"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
            >
              <div className="p-2 bg-gray-50 rounded-xl">
                <AlertCircle className="size-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Syarat & Ketentuan
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Aturan penggunaan layanan Canteeners
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href="/pusat-bantuan?back_url=/profil"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
            >
              <div className="p-2 bg-blue-50 rounded-xl">
                <HelpCircle className="size-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Pusat Bantuan
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Butuh bantuan? Hubungi tim kami
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header Profile */}
      <div className="bg-white border-b pb-8 px-5 pt-5">
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar className="size-24 border-4 border-white shadow-xl">
              <AvatarImage
                src={
                  session.user.avatar?.startsWith("http")
                    ? session.user.avatar
                    : getImageUrl(session.user.avatar)
                }
              />
              <AvatarFallback className="bg-red-50 text-red-600 text-2xl font-bold">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {isSuspended && (
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-2 border-white shadow-lg animate-pulse">
                <ShieldAlert className="size-4" />
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            {session.user.name}
            {isSuspended && (
              <Badge variant="destructive" className="ml-2 text-[10px] h-5">
                Diblokir
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {session.user.username || "Pelanggan Setia"}
          </p>
        </div>
      </div>

      {/* Referral Section  */}
      <div className="max-w-md mx-auto mt-4 px-5">
        <ReferralStatusCard
          referralCode={referralStatus?.referral_code || null}
          usageCount={referralStatus?.referral_usage_count || 0}
          isEligible={referralStatus?.is_eligible || false}
          onActivate={handleActivate}
          isActivating={isActivating}
        />
      </div>

      {/* Voucher Section */}
      <div className="max-w-md mx-auto mt-4 px-5">
        <UserVouchersSection vouchers={referralStatus?.vouchers || []} />
      </div>

      {/* Profile Menu */}
      <div className="max-w-md mx-auto mt-6 px-5 space-y-4">
        <div className="bg-white rounded-xl shadow border border-muted overflow-hidden">
          <Link
            href="/notifikasi"
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
          >
            <div className="p-2 bg-orange-50 rounded-xl">
              <Bell className="size-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Notifikasi</p>
              <p className="text-xs text-muted-foreground">
                Lihat pembaruan pesanan & laporan
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow border border-muted overflow-hidden">
          <Link
            href="/syarat-dan-ketentuan/pelanggan?back_url=/profil"
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
          >
            <div className="p-2 bg-blue-50 rounded-xl">
              <AlertCircle className="size-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Syarat & Ketentuan
              </p>
              <p className="text-xs text-muted-foreground">
                Aturan penggunaan layanan
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow border border-muted overflow-hidden">
          <Link
            href="/pusat-bantuan?back_url=/profil"
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
          >
            <div className="p-2 bg-blue-50 rounded-xl">
              <BookOpen className="size-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Panduan Pengguna
              </p>
              <p className="text-xs text-muted-foreground">
                Pelajari cara menggunakan aplikasi
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow border border-muted overflow-hidden">
          <Link
            href="/pusat-bantuan?back_url=/profil"
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
          >
            <div className="p-2 bg-blue-50 rounded-xl">
              <HelpCircle className="size-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Pusat Bantuan
              </p>
              <p className="text-xs text-muted-foreground">
                Butuh bantuan? Hubungi tim kami
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow border border-muted overflow-hidden">
          <Link
            href="/profil/pelanggaran"
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
          >
            <div className="p-2 bg-red-50 rounded-xl">
              <Gavel className="size-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Pelanggaran</p>
              <p className="text-xs text-muted-foreground">
                Cek status akun & riwayat pelanggaran
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSuspended && (
                <Badge variant="destructive" className="text-[8px] h-4">
                  DIBLOKIR
                </Badge>
              )}
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold gap-2 mt-4"
          onClick={() => signOut()}
        >
          <LogOut className="size-4" />
          Keluar dari Akun
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
