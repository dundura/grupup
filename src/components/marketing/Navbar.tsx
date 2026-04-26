"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

const findLinks = [
  { href: "/groups",    label: "Group Sessions", desc: "Browse trainer-led group sessions near you" },
  { href: "/trainers",  label: "Trainers",        desc: "Find and connect with coaches in your area" },
  { href: "/free-play", label: "Free Play",        desc: "Join pickup games and scrimmages"           },
];

const otherLinks = [
  { href: "/connect",     label: "Connect"      },
  { href: "/pricing",     label: "Pricing"      },
  { href: "/for-trainers",label: "For Trainers" },
  { href: "/blog",        label: "Blog"         },
];

export function Navbar() {
  const [open, setOpen]       = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const { isSignedIn }        = useAuth();
  const dropdownRef           = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFindOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <span>Grupup</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">

          {/* Find dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setFindOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors",
                findOpen ? "text-foreground" : "text-foreground/70 hover:text-foreground"
              )}
            >
              Find
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", findOpen && "rotate-180")} />
            </button>

            {findOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border bg-background shadow-lg p-1.5 z-50">
                {findLinks.map((link) => (
                  <Link key={link.href} href={link.href}
                    onClick={() => setFindOpen(false)}
                    className="flex flex-col px-3 py-2.5 rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm font-semibold">{link.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">{link.desc}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {otherLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" style={{ backgroundColor: "#DC373E" }}>Get Started</Button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/10"
          onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden border-t overflow-hidden transition-all duration-200", open ? "max-h-[32rem]" : "max-h-0")}>
        <div className="container py-4 flex flex-col gap-1">

          {/* Find group under mobile */}
          <p className="px-2 pt-1 pb-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Find</p>
          {findLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="py-2.5 px-3 text-base font-medium hover:bg-accent/10 rounded-lg transition-colors"
              onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}

          <div className="h-px bg-border my-1" />

          {otherLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="py-3 px-2 text-base font-medium hover:bg-accent/10 rounded-lg transition-colors"
              onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 pt-3 border-t mt-2">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <Button variant="outline" size="lg" className="w-full" onClick={() => setOpen(false)}>Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="lg" className="w-full" style={{ backgroundColor: "#DC373E" }} onClick={() => setOpen(false)}>Get Started</Button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                </Button>
                <div className="flex justify-center pt-1">
                  <UserButton />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
