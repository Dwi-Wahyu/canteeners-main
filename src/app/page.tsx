import LandingTopbar from "@/components/layouts/landing-topbar";
import LandingFooter from "@/components/layouts/landing-footer";
import LandingAnimatedPage from "@/components/landing-animated-page";
import { getAppTestimonies } from "@/features/testimony/lib/testimony-queries";

export default async function LandingPage() {
  const testimonies = await getAppTestimonies(8);

  return (
    <>
      <LandingTopbar />
      <LandingAnimatedPage testimonies={testimonies} />
      <LandingFooter />
    </>
  );
}
