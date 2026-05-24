import Link from "next/link";
import { getCanteens } from "@/features/canteen/lib/canteen-queries";
import { getCategories } from "@/features/category/lib/category-queries";
import { getImageUrl } from "@/helper/get-image-url";
import { auth } from "@/config/auth";

import { BottomNav } from "@/components/layouts/bottom-nav";
import CanteenBanner from "@/features/banner/ui/canteen-banner";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CanteenPage() {
  const session = await auth();

  if (session && session.user.role === "SHOP_OWNER") {
    redirect("/dashboard-kedai");
  }

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
      c.shops.reduce((acc, s) => acc + s.average_rating, 0) / c.shops.length ||
      0
    ).toFixed(1),
    deliveryTime: "15-20 mnt",
    deliveryFee: "Rp 0 (Promo)",
  }));

  // const mappedCategories = [
  //   ...categoriesData.map((cat) => ({
  //     label: cat.name,
  //     icon: categoryIconMap[cat.name] || "restaurant",
  //     img: getImageUrl("/category/" + cat.image_url),
  //   })),
  //   {
  //     label: "Semua",
  //     icon: "apps",
  //     img: null,
  //   },
  // ];

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
        <CanteenBanner />

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
            {mappedCanteens.map((canteen, idx) => (
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
