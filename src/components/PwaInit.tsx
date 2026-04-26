"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInit() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    setDeferredPrompt(null);
  }

  function dismiss() {
    setShowBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "1");
  }

  if (!showBanner) return null;

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
          <button
            onClick={handleInstall}
            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
            style={{ backgroundColor: "#DC373E" }}
          >
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
