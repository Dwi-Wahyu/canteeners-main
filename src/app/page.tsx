import LandingTopbar from "@/components/layouts/landing-topbar";
import LandingFooter from "@/components/layouts/landing-footer";
import LandingAnimatedPage from "@/components/landing-animated-page";
import { getAppTestimonies } from "@/features/testimony/lib/testimony-queries";

const testimonies = await getAppTestimonies(8);

export default async function LandingPage() {
  return (
    <>
      <LandingTopbar />
      <LandingAnimatedPage testimonies={testimonies} />
      <LandingFooter />
    </>
  );
}
