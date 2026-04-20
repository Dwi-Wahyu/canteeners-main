"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCanteens } from "@/features/canteen/lib/canteen-queries";
import { getCategories } from "@/features/category/lib/category-queries";
import { getImageUrl } from "@/helper/get-image-url";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { BottomNav } from "@/components/layouts/bottom-nav";

const categoryIconMap: Record<string, string> = {
  "Es Buah": "emoji_food_beverage",
  Ayam: "restaurant",
  Gorengan: "local_fire_department",
  Mie: "ramen_dining",
  Minuman: "local_cafe",
  Nasi: "rice_bowl",
  Bakso: "soup_kitchen",
  Semua: "apps",
};

const banners = [
  {
    tag: "Promo Spesial",
    tagBg: "bg-[#DC2626]",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80",
    title: "Diskon 50% Es Buah Segar",
    desc: "Segarkan harimu dengan es buah aneka rasa. Berlaku hari ini saja!",
    cta: "Klaim Sekarang",
  },
  {
    tag: "Menu Baru",
    tagBg: "bg-amber-600",
    img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c4?w=1200&q=80",
    title: "Ayam Geprek Level Dewa",
    desc: "Berani coba pedasnya? Tantang dirimu sekarang juga.",
    cta: "Coba Sekarang",
  },
  {
    tag: "Gratis Ongkir",
    tagBg: "bg-[#555f6f]",
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80",
    title: "Bebas Antri, Langsung Sampai",
    desc: "Pesan aneka gorengan favoritmu tanpa biaya tambahan antar ke kelas.",
    cta: "Pesan Disini",
  },
];

export default function CanteenPage() {
  const { data: session } = useSession();
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [canteens, setCanteens] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [canteensData, categoriesData] = await Promise.all([
        getCanteens(),
        getCategories(),
      ]);

      const mappedCanteens = canteensData.map((c) => ({
        slug: c.slug || "",
        image_url: getImageUrl("/canteen/" + c.image_url),
        name: c.name,
        description: c.shops.map((s) => s.name).join(", ") || "Aneka Menu",
        location: c.maps.length > 0 ? `Lantai ${c.maps[0].floor}` : "Kantin",
        rating: (
          c.shops.reduce((acc, s) => acc + s.average_rating, 0) /
            c.shops.length || 0
        ).toFixed(1),
        deliveryTime: "15-20 mnt",
        deliveryFee: "Rp 0 (Promo)",
      }));

      const mappedCategories = [
        ...categoriesData.map((cat) => ({
          label: cat.name,
          icon: categoryIconMap[cat.name] || "restaurant",
          img: getImageUrl("/category/" + cat.image_url),
        })),
        {
          label: "Semua",
          icon: "apps",
          img: null,
        },
      ];

      setCanteens(mappedCanteens);
      setCategories(mappedCategories);
    }

    fetchData();
  }, []);

  return (
    <div
      className="min-h-screen pb-28 md:pb-0"
      style={{
        background: "#f8f9ff",
        fontFamily:
          "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── Mobile Header ── */}
      <div className="md:hidden flex justify-between items-center px-4 py-4 bg-white/95 backdrop-blur-xl z-40 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs" style={{ color: "#555f6f" }}>
              Selamat Datang,
            </p>
            <p className="font-bold text-sm" style={{ color: "#0b1c30" }}>
              {session?.user?.name || "Canteeners"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "#eff4ff", color: "#DC2626" }}
            aria-label="Cari"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              search
            </span>
          </button>
          <Link
            href="/notifikasi"
            className="w-10 h-10 rounded-full flex items-center justify-center relative transition-colors"
            style={{ background: "#eff4ff", color: "#DC2626" }}
            aria-label="Notifikasi"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              notifications
            </span>
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white"
              style={{ background: "#DC2626" }}
            />
          </Link>
        </div>
      </div>

      <main className="md:pt-28 pt-4 pb-6 max-w-7xl mx-auto px-4 md:px-6">
        {/* ── Hero Banners ── */}
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-2xl">
            {banners.map((banner, i) => (
              <div
                key={i}
                className="transition-all duration-500"
                style={{ display: i === activeBanner ? "block" : "none" }}
              >
                <div className="relative rounded-2xl overflow-hidden aspect-[16/7] md:aspect-[21/7]">
                  <img
                    src={banner.img}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    style={{ transition: "transform 0.5s ease" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
                    }}
                  />
                  <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center w-2/3 md:w-1/2">
                    <span
                      className={`inline-block px-3 py-1 ${banner.tagBg} text-white text-[10px] font-bold uppercase tracking-wider rounded-full w-max mb-3`}
                    >
                      {banner.tag}
                    </span>
                    <h2
                      className="font-extrabold text-white mb-2 leading-tight"
                      style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
                    >
                      {banner.title}
                    </h2>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2 hidden sm:block">
                      {banner.desc}
                    </p>
                    <Link
                      href="/kantin/kantin-kudapan"
                      className="inline-block bg-white px-5 py-2 rounded-full font-bold text-sm w-max transition-all hover:shadow-lg"
                      style={{ color: "#DC2626" }}
                    >
                      {banner.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Indicators */}
          <div className="flex justify-center gap-2 mt-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBanner(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeBanner ? 24 : 8,
                  height: 8,
                  background: i === activeBanner ? "#DC2626" : "#dce9ff",
                }}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ── Kategori Pilihan ── */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-5">
            <div>
              <h3
                className="font-extrabold tracking-tight"
                style={{ color: "#0b1c30", fontSize: "1.2rem" }}
              >
                Kategori Pilihan
              </h3>
              <p className="text-sm mt-0.5" style={{ color: "#555f6f" }}>
                Mau makan apa hari ini?
              </p>
            </div>
            <button
              className="text-sm font-semibold hover:underline transition-colors"
              style={{ color: "#DC2626" }}
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-5">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className="group flex flex-col items-center gap-2 transition-all"
              >
                <div
                  className="w-16 h-16 md:w-18 md:h-18 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    background:
                      activeCategory === cat.label
                        ? "linear-gradient(135deg, #b70011 0%, #dc2626 100%)"
                        : "#ffffff",
                    boxShadow:
                      activeCategory === cat.label
                        ? "0 8px 24px -4px rgba(220,38,38,0.35)"
                        : "0 4px 24px rgba(11,28,48,0.06)",
                  }}
                >
                  {cat.img ? (
                    <img
                      src={cat.img}
                      alt={cat.label}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  ) : (
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 26,
                        color:
                          activeCategory === cat.label ? "#fff" : "#DC2626",
                      }}
                    >
                      {cat.icon}
                    </span>
                  )}
                </div>
                <span
                  className="text-[11px] font-semibold text-center transition-colors"
                  style={{
                    color: activeCategory === cat.label ? "#DC2626" : "#0b1c30",
                  }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Kantin Populer ── */}
        <section>
          <div className="flex justify-between items-end mb-5">
            <div>
              <h3
                className="font-extrabold tracking-tight"
                style={{ color: "#0b1c30", fontSize: "1.2rem" }}
              >
                Kantin Populer
              </h3>
              <p className="text-sm mt-0.5" style={{ color: "#555f6f" }}>
                Paling sering dipesan minggu ini
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {canteens.map((canteen, idx) => (
              <Link href={"/kantin/" + canteen.slug} key={idx}>
                <article
                  className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "#ffffff",
                    boxShadow: "0 4px 32px rgba(11,28,48,0.06)",
                  }}
                >
                  {/* Image */}
                  <div className="relative h-44 md:h-52 w-full overflow-hidden">
                    <img
                      src={canteen.image_url}
                      alt={canteen.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Rating + Time badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className="backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        style={{
                          background: "rgba(255,255,255,0.9)",
                          color: "#DC2626",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: 12,
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          star
                        </span>
                        {canteen.rating}
                      </span>
                      <span
                        className="backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold"
                        style={{
                          background: "rgba(255,255,255,0.9)",
                          color: "#555f6f",
                        }}
                      >
                        {canteen.deliveryTime}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1.5">
                      <h4
                        className="font-extrabold text-base"
                        style={{ color: "#0b1c30" }}
                      >
                        {canteen.name}
                      </h4>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:rotate-12"
                        style={{
                          background: "#eff4ff",
                          color: "#DC2626",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 16 }}
                        >
                          arrow_forward
                        </span>
                      </div>
                    </div>
                    <p
                      className="text-sm mb-3 leading-relaxed"
                      style={{ color: "#555f6f" }}
                    >
                      {canteen.description}
                    </p>
                    <div
                      className="flex items-center gap-4 text-xs pt-3"
                      style={{
                        color: "#555f6f",
                        borderTop: "1px solid #eff4ff",
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 14 }}
                        >
                          local_shipping
                        </span>
                        {canteen.deliveryFee}
                      </div>
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ background: "#dce9ff" }}
                      />
                      <div className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 14 }}
                        >
                          storefront
                        </span>
                        {canteen.location}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
