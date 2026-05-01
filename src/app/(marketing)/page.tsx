import { Hero } from "@/components/marketing/Hero";
import { TrustSection } from "@/components/marketing/TrustSection";
import { FeaturedTrainersCarousel } from "@/components/marketing/FeaturedTrainersCarousel";
import { FeaturedPlayersCarousel } from "@/components/marketing/FeaturedPlayersCarousel";
import { BlogPreview } from "@/components/marketing/BlogPreview";
import { Testimonials } from "@/components/marketing/Testimonials";
import { AppDownloadSection } from "@/components/marketing/AppDownloadSection";
import { CTASection } from "@/components/marketing/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedTrainersCarousel />
      <FeaturedPlayersCarousel />
      <TrustSection />
      <BlogPreview />
      <Testimonials />
      <AppDownloadSection />
      <CTASection />
    </>
  );
}
