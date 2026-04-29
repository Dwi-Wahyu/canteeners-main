"use client";

import { useQueryState, parseAsArrayOf, parseAsInteger } from "nuqs";
import { getImageUrl } from "@/helper/get-image-url";
import { cn } from "@/lib/utils";

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

interface Category {
  id: number;
  name: string;
  image_url: string;
}

export function CanteenCategoryFilter({
  categories,
}: {
  categories: Category[];
}) {
  const [selectedCategories, setSelectedCategories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsInteger).withDefault([]),
  );

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId),
        { shallow: false },
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId], {
        shallow: false,
      });
    }
  };

  const isSelected = (categoryId: number) =>
    selectedCategories.includes(categoryId);

  const clearCategories = () => setSelectedCategories(null, { shallow: false });

  const isAllSelected = selectedCategories.length === 0;

  return (
    <section className="mb-2 overflow-visible">
      {/* ── Header: "Kategori Pilihan" + "Semua" pill ── */}
      <div className="flex items-center justify-between px-5 mb-3">
        <div>
          <h3
            className="font-extrabold tracking-tight"
            style={{ color: "#0b1c30", fontSize: "1.05rem" }}
          >
            Kategori Pilihan
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#555f6f" }}>
            Cari kedai berdasarkan spesialisasinya
          </p>
        </div>

        {/* "Semua" pill — always visible, active when nothing selected */}
        <button
          onClick={clearCategories}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200",
            isAllSelected
              ? "bg-gradient-to-r from-[#b70011] to-[#dc2626] text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]"
              : "bg-white text-[#dc2626] border border-[#dc2626]/30 hover:border-[#dc2626]/60",
          )}
        >
          {/* <span
            className="material-symbols-outlined"
            style={{ fontSize: 14, lineHeight: 1 }}
          >
            apps
          </span> */}
          Semua
        </button>
      </div>

      {/* ── Horizontal scroll: only specific categories ── */}
      <div className="flex overflow-x-auto pt-1 pb-4 px-5 gap-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className="group flex flex-col items-center gap-2 transition-all shrink-0"
          >
            <div
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:-translate-y-1",
                isSelected(cat.id)
                  ? "bg-gradient-to-br from-[#b70011] to-[#dc2626] shadow-[0_8px_24px_-4px_rgba(220,38,38,0.35)]"
                  : "bg-white shadow-[0_4px_24px_rgba(11,28,48,0.06)]",
              )}
            >
              {cat.image_url ? (
                <img
                  src={getImageUrl("/category/" + cat.image_url)}
                  alt={cat.name}
                  className="w-9 h-9 object-cover rounded-full"
                />
              ) : (
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 24,
                    color: isSelected(cat.id) ? "#fff" : "#DC2626",
                  }}
                >
                  {categoryIconMap[cat.name] || "restaurant"}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold text-center transition-colors",
                isSelected(cat.id) ? "text-[#DC2626]" : "text-[#0b1c30]",
              )}
            >
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
