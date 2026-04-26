"use client";

import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ConnectPage() {
  return (
    <div>
      <div className="border-b bg-secondary/20">
        <div className="container py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Connect</h1>
          <p className="text-muted-foreground">
            Find players, parents, and squads looking for group training partners near you.
          </p>
        </div>
      </div>

      <div className="container py-20 text-center max-w-md mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-6"
          style={{ backgroundColor: "#f0f4f9" }}>
          <Users className="h-8 w-8" style={{ color: "#0F3154" }} />
        </div>
        <h2 className="text-2xl font-bold mb-3">Player profiles coming soon</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Once players sign up and complete their profiles, you'll be able to find training partners,
          connect with squads, and organize group sessions together.
        </p>
        <Button style={{ backgroundColor: "#DC373E" }} asChild>
          <Link href="/sign-up">Create your profile</Link>
        </Button>
      </div>
    </div>
  );
}
