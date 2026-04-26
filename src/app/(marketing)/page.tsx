import { Hero } from "@/components/marketing/Hero";
import { TrustSection } from "@/components/marketing/TrustSection";
import { BlogPreview } from "@/components/marketing/BlogPreview";
import { Testimonials } from "@/components/marketing/Testimonials";
import { AppDownloadSection } from "@/components/marketing/AppDownloadSection";
import { CTASection } from "@/components/marketing/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustSection />
      <BlogPreview />
      <Testimonials />
      <AppDownloadSection />
      <CTASection />
    </>
  );
}
