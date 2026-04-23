import Image from "next/image";
import { Star, MapPin, Award, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Trainer } from "@/lib/types";

interface TrainerDetailHeroProps {
  trainer: Trainer;
}

export function TrainerDetailHero({ trainer }: TrainerDetailHeroProps) {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b">
      <div className="container py-8 md:py-12">
        <div className="grid md:grid-cols-[320px_1fr] gap-6 md:gap-10 items-start">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted max-w-[320px] mx-auto md:mx-0 w-full shadow-xl">
            <Image src={trainer.photo} alt={trainer.name} fill className="object-cover" priority sizes="320px" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="soft">{trainer.yearsExperience}+ years</Badge>
              {trainer.skillLevels.includes("Elite") && <Badge variant="accent">Elite level</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{trainer.name}</h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="font-semibold text-foreground">{trainer.rating}</span>
                <span>({trainer.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{trainer.city}, {trainer.state}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                <span>{trainer.yearsExperience} yrs experience</span>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-foreground/80 mb-6 max-w-2xl">{trainer.bio}</p>

            <div className="flex flex-wrap gap-2">
              {trainer.specialties.map((spec) => (
                <Badge key={spec} variant="soft">{spec}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
