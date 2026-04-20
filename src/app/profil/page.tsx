"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl } from "@/helper/get-image-url";
import {
  User,
  Settings,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronRight,
  CreditCard,
  Gift,
  Copy,
  AlertCircle,
} from "lucide-react";
import { BottomNav } from "@/components/layouts/bottom-nav";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCustomerReferralStatus } from "@/features/user/lib/user-queries";
import { activateReferralCode } from "@/features/user/lib/user-actions";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const { data: session } = useSession();
  const [referralStatus, setReferralStatus] = useState<{
    referral_code: string | null;
    completed_orders_count: number;
    is_eligible: boolean;
    referral_usage_count: number;
    vouchers: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchStatus();
    }
  }, [session?.user?.id]);

  const fetchStatus = async () => {
    try {
      const status = await getCustomerReferralStatus(session!.user.id);
      setReferralStatus(status as any);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    const res = await activateReferralCode();
    setIsActivating(false);

    if (res.success) {
      toast.success(res.message);
      fetchStatus();
    } else {
      toast.error(res.error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kode referral berhasil disalin!");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5">
        <p className="text-muted-foreground mb-4">
          Silakan login untuk melihat profil Anda.
        </p>
        <Button asChild>
          <Link href="/login-pelanggan">Login Sekarang</Link>
        </Button>
      </div>
    );
  }

  const profileMenu = [
    {
      icon: <User className="size-5 text-blue-500" />,
      label: "Edit Profil",
      href: "/dashboard-pelanggan/edit",
      description: "Ubah nama, email, dan foto profil",
    },
    {
      icon: <CreditCard className="size-5 text-green-500" />,
      label: "Metode Pembayaran",
      href: "#",
      description: "Kelola kartu dan e-wallet",
    },
    {
      icon: <Bell className="size-5 text-amber-500" />,
      label: "Notifikasi",
      href: "/notifikasi",
      description: "Atur preferensi notifikasi Anda",
    },
    {
      icon: <ShieldCheck className="size-5 text-purple-500" />,
      label: "Keamanan",
      href: "#",
      description: "Ubah kata sandi dan keamanan akun",
    },
    {
      icon: <Settings className="size-5 text-gray-500" />,
      label: "Pengaturan",
      href: "#",
      description: "Pengaturan aplikasi dan lainnya",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header Profile */}
      <div className="bg-white border-b pb-8 px-5 pt-5">
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar className="size-24 border-4 border-white shadow-xl">
              <AvatarImage src={getImageUrl(session.user.avatar)} />
              <AvatarFallback className="bg-red-50 text-red-600 text-2xl font-bold">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border">
              <Settings className="size-4 text-gray-500" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900">
            {session.user.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {session.user.username ||
              session.user.username ||
              "Pelanggan Setia"}
          </p>
        </div>
      </div>

      {/* Referral Section */}
      <div className="max-w-md mx-auto mt-6 px-5">
        <Card className="border-dashed border-2 bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200 overflow-hidden relative">
          <div className="absolute -right-6 -top-6 bg-blue-100 size-24 rounded-full blur-2xl opacity-50" />
          <CardContent className="relative">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-200">
                <Gift className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Program Referral
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Ajak teman dan nikmati keuntungan bersama di Canteeners!
                </p>

                {loading ? (
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded-xl" />
                ) : referralStatus?.referral_code ? (
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-xl border flex items-center justify-between group">
                      <span className="font-mono font-bold text-blue-600 tracking-wider">
                        {referralStatus.referral_code}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600"
                        onClick={() =>
                          copyToClipboard(referralStatus.referral_code!)
                        }
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>

                    <div className="bg-white/50 rounded-xl p-3 border border-blue-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                          Progres Cashback 10rb
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {referralStatus.referral_usage_count}/3 Orang
                        </span>
                      </div>
                      <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (referralStatus.referral_usage_count / 3) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-blue-700 mt-2 leading-tight">
                        Ajak {3 - referralStatus.referral_usage_count} orang
                        lagi menggunakan kodemu untuk dapat cashback 10rb!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-blue-600">
                        Selesaikan{" "}
                        {2 - (referralStatus?.completed_orders_count || 0)}{" "}
                        pesanan lagi untuk aktivasi kode.
                      </span>
                    </div>

                    {referralStatus?.is_eligible && (
                      <Button
                        onClick={handleActivate}
                        disabled={isActivating}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                      >
                        {isActivating ? (
                          <div className="flex items-center gap-2">
                            <div className="size-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                            Mengaktifkan...
                          </div>
                        ) : (
                          "Aktivasi Kode Referral"
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Section */}
      {referralStatus?.vouchers && referralStatus.vouchers.length > 0 && (
        <div className="max-w-md mx-auto mt-6 px-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1 mb-3">
            Voucher Saya
          </h2>
          <div className="space-y-3">
            {referralStatus.vouchers.map((voucher) => (
              <Card
                key={voucher.id}
                className="overflow-hidden border-none shadow-sm bg-white relative group"
              >
                {/* Potongan Kiri (Efek Tiket) */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-gray-50 rounded-r-full border-r border-gray-100" />
                {/* Potongan Kanan (Efek Tiket) */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-gray-50 rounded-l-full border-l border-gray-100" />

                <CardContent className="p-4 flex items-center gap-4">
                  <div className="size-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                    <Gift className="size-7 text-amber-600" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {voucher.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {voucher.description || "Gunakan saat checkout pesananmu"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 uppercase">
                        {voucher.type === "FIXED"
                          ? "Potongan Langsung"
                          : "Persentase"}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/kantin"
                    className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"
                  >
                    <ChevronRight className="size-5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Profile Menu */}
      <div className="max-w-md mx-auto mt-6 px-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">
          Akun Saya
        </h2>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {profileMenu.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
            >
              <div className="p-2 bg-gray-50 rounded-xl">{item.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="size-4 text-gray-400" />
            </Link>
          ))}
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
