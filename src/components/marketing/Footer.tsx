import Link from "next/link";
import { Zap, Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-5 w-5" />
              </div>
              <span>Grup<span style={{ color: "#DC373E", fontWeight: 900 }}>Up</span></span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The only platform built for group sports training sessions. Find coaches near you.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/groups" className="hover:text-foreground transition-colors">Find Groups</Link></li>
              <li><Link href="/free-play" className="hover:text-foreground transition-colors">Free Play</Link></li>
              <li><Link href="/connect" className="hover:text-foreground transition-colors">Connect</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/for-trainers" className="hover:text-foreground transition-colors">For Trainers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link href="/refund-policy" className="hover:text-foreground transition-colors">Refund & Cancellation</Link></li>
              <li><Link href="/safety" className="hover:text-foreground transition-colors">Safety</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Grupup. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/10 transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/10 transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="YouTube" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent/10 transition-colors">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
