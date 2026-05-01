import { getBanners } from "../lib/banner-queries";
import CanteenBannerClient from "./canteen-banner-client";
import { getImageUrl } from "@/helper/get-image-url";
import { cacheLife } from "next/cache";

export default async function CanteenBanner() {
  const bannersData = await getBanners();
  
  const mappedBanners = bannersData.map((b) => ({
    id: b.id,
    img: getImageUrl("/banners/" + b.file),
    cta: b.cta_path,
  }));

  return (
    <section className="mb-10">
      <CanteenBannerClient banners={mappedBanners} />
    </section>
  );
}
