"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Instagram,
  MessageCircle,
  Mail,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";

function PusatBantuanContent() {
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("back_url") || "/kantin";

  const supportLinks = [
    {
      title: "WhatsApp",
      description: "Chat langsung dengan tim kami (08.00 - 20.00)",
      icon: <MessageCircle className="size-6" />,
      href: "https://wa.me/6281234567890", // Placeholder
      label: "+62 812-3456-7890",
      color: "hover:bg-green-50",
    },
    {
      title: "Instagram",
      description: "Ikuti kami untuk update terbaru",
      icon: <Instagram className="size-6" />,
      href: "https://instagram.com/canteeners", // Placeholder
      label: "@canteeners",
      color: "hover:bg-pink-50",
    },
    {
      title: "Email",
      description: "Kirim pertanyaan melalui email",
      icon: <Mail className="size-6" />,
      href: "mailto:support@canteeners.com",
      label: "support@canteeners.com",
      color: "hover:bg-blue-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <div className="bg-white border-b px-5 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href={backUrl}>
            <ChevronLeft className="size-6" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Pusat Bantuan</h1>
      </div>

      <div className="max-w-md mx-auto p-5 space-y-6">
        {/* Intro */}
        <div className="text-center py-4">
          <div className="bg-primary/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="size-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Ada yang bisa kami bantu?</h2>
          <p className="text-sm text-muted-foreground mt-2 text-balance">
            Tim kami siap membantu kendala atau pertanyaan Anda.
          </p>
        </div>

        {/* Support Cards */}
        <div className="space-y-4">
          {supportLinks.map((link, idx) => (
            <Link key={idx} href={link.href} target="_blank">
              <Card
                className={`transition-colors ${link.color} cursor-pointer border-gray-100 mb-3`}
              >
                <CardContent className="gap-4">
                  <div className="p-3 bg-white w-fit rounded-xl shadow mb-4 border border-gray-50">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                    <span className="flex items-center mt-4 justify-end gap-2">
                      <p className="text-sm font-semibold mt-1 text-primary">
                        {link.label}
                      </p>
                      <ExternalLink className="size-4 text-gray-500" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* FAQ Link */}
        <Card className="bg-primary text-primary-foreground overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Butuh jawaban cepat?
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Lihat pertanyaan yang sering diajukan di halaman FAQ kami.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full font-bold" asChild>
              <Link
                href={`/faq?back_url=/pusat-bantuan?back_url=${encodeURIComponent(backUrl)}`}
              >
                Buka FAQ
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Copyright or Version */}
        <div className="text-center pt-8 opacity-40">
          <p className="text-[10px] font-medium tracking-widest uppercase">
            Canteeners Support Center
          </p>
          <p className="text-xs mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export default function PusatBantuanPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Memuat...</div>}>
      <PusatBantuanContent />
    </Suspense>
  );
}
