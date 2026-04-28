"use client";

import { useEffect, useState } from "react";
import { X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return ("standalone" in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches;
}

export function PwaInit() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    // Already installed — don't show anything
    if (isInStandaloneMode()) return;

    const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    // iOS: show manual instructions
    if (isIos()) {
      setTimeout(() => setShowIosBanner(true), 3000);
      return;
    }

    // Android/Chrome: use native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowAndroidBanner(false);
    setDeferredPrompt(null);
  }

  function dismiss() {
    setShowAndroidBanner(false);
    setShowIosBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  }

  // Android install banner
  if (showAndroidBanner) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="rounded-2xl shadow-2xl border p-4 flex items-center gap-3"
          style={{ backgroundColor: "#0F3154" }}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M13 3L5 13h7l-1 8 8-10h-7l1-8z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">Add Grupup to your home screen</p>
            <p className="text-white/50 text-xs mt-0.5">Book sessions faster, anywhere</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleInstall}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: "#DC373E" }}>
              Install
            </button>
            <button onClick={dismiss} className="text-white/40 hover:text-white/70 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // iOS instructions banner
  if (showIosBanner) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="rounded-2xl shadow-2xl p-4" style={{ backgroundColor: "#0F3154" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                  <path d="M13 3L5 13h7l-1 8 8-10h-7l1-8z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Add Grupup to Home Screen</p>
                <p className="text-white/50 text-xs">Book sessions like a native app</p>
              </div>
            </div>
            <button onClick={dismiss} className="text-white/40 hover:text-white/70 ml-2 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-white/10 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2.5 text-white/80 text-xs">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white text-[10px] font-bold">1</span>
              <span>Tap the <strong className="text-white">Share</strong> button <span className="inline-flex items-center gap-0.5 align-middle">(<Share className="h-3.5 w-3.5 inline" />)</span> at the bottom of Safari</span>
            </div>
            <div className="flex items-center gap-2.5 text-white/80 text-xs">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white text-[10px] font-bold">2</span>
              <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-white/80 text-xs">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white text-[10px] font-bold">3</span>
              <span>Tap <strong className="text-white">Add</strong> — done!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
