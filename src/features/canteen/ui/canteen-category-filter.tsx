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
    parseAsArrayOf(parseAsInteger).withDefault([])
  );

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId),
        { shallow: false }
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

  return (
    <section className="mb-2 overflow-visible">
      <div className="flex justify-between items-end mb-4 px-5">
        <div>
          <h3
            className="font-extrabold tracking-tight"
            style={{ color: "#0b1c30", fontSize: "1.1rem" }}
          >
            Kategori Pilihan
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#555f6f" }}>
            Cari kedai berdasarkan spesialisasinya
          </p>
        </div>
        {(selectedCategories.length > 0) && (
          <button
            onClick={clearCategories}
            className="text-xs font-semibold hover:underline transition-colors"
            style={{ color: "#DC2626" }}
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex overflow-x-auto pt-2 pb-4 px-5 gap-4 scrollbar-hide">
        <button
          onClick={clearCategories}
          className="group flex flex-col items-center gap-2 transition-all shrink-0"
        >
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:-translate-y-1",
              selectedCategories.length === 0
                ? "bg-gradient-to-br from-[#b70011] to-[#dc2626] shadow-[0_8px_24px_-4px_rgba(220,38,38,0.35)]"
                : "bg-white shadow-[0_4px_24px_rgba(11,28,48,0.06)]"
            )}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 24,
                color: selectedCategories.length === 0 ? "#fff" : "#DC2626",
              }}
            >
              apps
            </span>
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold text-center transition-colors",
              selectedCategories.length === 0 ? "text-[#DC2626]" : "text-[#0b1c30]"
            )}
          >
            Semua
          </span>
        </button>

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
                  : "bg-white shadow-[0_4px_24px_rgba(11,28,48,0.06)]"
              )}
            >
              {cat.image_url ? (
                <img
                  src={getImageUrl("/category/" + cat.image_url)}
                  alt={cat.name}
                  className={cn(
                    "w-9 h-9 object-cover rounded-full"
                  )}
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
                isSelected(cat.id) ? "text-[#DC2626]" : "text-[#0b1c30]"
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
