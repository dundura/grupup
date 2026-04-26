import { Hero } from "@/components/marketing/Hero";
import { BlogPreview } from "@/components/marketing/BlogPreview";
import { Testimonials } from "@/components/marketing/Testimonials";
import { AppDownloadSection } from "@/components/marketing/AppDownloadSection";
import { CTASection } from "@/components/marketing/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BlogPreview />
      <Testimonials />
      <AppDownloadSection />
      <CTASection />
    </>
  );
}
