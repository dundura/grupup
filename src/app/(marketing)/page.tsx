import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturedTrainers } from "@/components/marketing/FeaturedTrainers";
import { BlogPreview } from "@/components/marketing/BlogPreview";
import { Testimonials } from "@/components/marketing/Testimonials";
import { AppDownloadSection } from "@/components/marketing/AppDownloadSection";
import { CTASection } from "@/components/marketing/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedTrainers />
      <BlogPreview />
      <Testimonials />
      <AppDownloadSection />
      <CTASection />
    </>
  );
}
