import LandingTopbar from "@/components/layouts/landing-topbar";
import LandingFooter from "@/components/layouts/landing-footer";
import LandingAnimatedPage from "@/components/landing-animated-page";

export default async function LandingPage() {
  return (
    <>
      <LandingTopbar />
      <LandingAnimatedPage />
      <LandingFooter />
    </>
  );
}
