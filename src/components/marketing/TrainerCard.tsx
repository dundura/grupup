import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Trainer } from "@/lib/types";

interface TrainerCardProps {
  trainer: Trainer;
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <Link
      href={`/trainers/${trainer.id}`}
      className="group block bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <Image
          src={trainer.photo}
          alt={trainer.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/95 backdrop-blur px-2.5 py-1 rounded-full text-sm font-semibold">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span>{trainer.rating}</span>
          <span className="text-muted-foreground text-xs">({trainer.reviewCount})</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg leading-tight">{trainer.name}</h3>
          <div className="text-right shrink-0">
            <div className="font-bold text-lg leading-none">${trainer.hourlyRate}</div>
            <div className="text-xs text-muted-foreground mt-0.5">/ session</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <MapPin className="h-3.5 w-3.5" />
          <span>{trainer.city}, {trainer.state}</span>
          <span className="mx-1.5">·</span>
          <span>{trainer.yearsExperience} yrs exp</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {trainer.specialties.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="soft" className="text-xs">
              {spec}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
