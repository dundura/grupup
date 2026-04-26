"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  Show,
} from "@clerk/nextjs";

export function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/groups", label: "Find Group Sessions" },
    { href: "/free-play", label: "Find Free Play" },
    { href: "/connect", label: "Connect" },
    { href: "/pricing", label: "Pricing" },
    { href: "/for-trainers", label: "For Trainers" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <span>Grupup</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" style={{ backgroundColor: "#DC373E" }}>Get Started</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton />
          </Show>
        </div>

        <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/10"
          onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("md:hidden border-t overflow-hidden transition-all duration-200", open ? "max-h-96" : "max-h-0")}>
        <div className="container py-4 flex flex-col gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}
              className="py-3 px-2 text-base font-medium hover:bg-accent/10 rounded-lg transition-colors"
              onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t mt-2">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="outline" size="lg" className="w-full" onClick={() => setOpen(false)}>
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="lg" className="w-full" style={{ backgroundColor: "#DC373E" }} onClick={() => setOpen(false)}>
                  Get Started
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              </Button>
              <div className="flex justify-center pt-1">
                <UserButton />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}
