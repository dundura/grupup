import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturedTrainers } from "@/components/marketing/FeaturedTrainers";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CTASection } from "@/components/marketing/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <FeaturedTrainers />
      <Testimonials />
      <CTASection />
    </>
  );
}
