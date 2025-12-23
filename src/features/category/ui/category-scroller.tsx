"use client";

import { useQueryState } from "nuqs";
import { GetCategories } from "../types/category-queries-types";
import { getImageUrl } from "@/helper/get-image-url";

export default function CategoryScroller({
  categories,
}: {
  categories: GetCategories;
}) {
  const itemWidthClass =
    "min-w-[calc(100%/4)] sm:min-w-[160px] md:min-w-[200px]";

  const [categorySlug, setCategorySlug] = useQueryState("categories", {
    shallow: false,
    clearOnDefault: true,
    defaultValue: "",
  });

  return (
    <div
      className="w-full overflow-x-auto pt-3"
      style={{
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <style jsx global>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="flex space-x-2 px-2">
        {categories.map((category) => (
          <div
            onClick={() => {
              setCategorySlug(category.slug);
            }}
            className={`
              ${itemWidthClass}
              shrink-0
              flex cursor-pointer flex-col gap-2 items-center text-center
              transition-opacity duration-200
            `}
            key={category.id}
          >
            <div
              className={`
                p-1 rounded-lg border-4
                transition-all duration-300 ease-in-out
                ${category.slug === categorySlug
                  ? "border-primary/50 shadow-lg "
                  : "border-transparent hover:shadow-xl "
                }
              `}
            >
              <img
                src={getImageUrl(category.image_url)}
                alt={category.name + " image"}
                width="96"
                height="96"
                className="rounded-sm object-cover w-24 h-24"
              />
            </div>
            <h1
              className={`
                text-sm font-semibold whitespace-normal leading-tight max-w-[90%]
                ${category.slug === categorySlug
                  ? "text-primary"
                  : "text-gray-700 dark:text-gray-300"
                }
              `}
            >
              {category.name}
            </h1>
          </div>
        ))}
      </div>
    </div>
  );
}
