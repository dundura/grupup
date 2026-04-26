import Link from "next/link";

export function AppDownloadSection() {
  return (
    <section className="py-20 px-4" style={{ backgroundColor: "#0F3154" }}>
      <div className="container max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: "rgba(220,55,62,0.15)", color: "#f87171" }}>
              📱 Available on iOS & Android
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Train together.<br />On the go.
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Book sessions, find pickup games, and connect with trainers — all from your phone.
              Get notified the moment a spot opens near you.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* App Store */}
              <Link href="#" aria-label="Download on the App Store"
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <p className="text-white/50 text-xs leading-none mb-0.5">Download on the</p>
                  <p className="text-white font-semibold text-sm leading-none">App Store</p>
                </div>
              </Link>

              {/* Google Play */}
              <Link href="#" aria-label="Get it on Google Play"
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.18 23.76c.29.16.63.17.93.02l12.26-7.03-2.76-2.76-10.43 9.77zM.5 1.47C.19 1.8 0 2.3 0 2.96v18.08c0 .66.19 1.16.5 1.49L.6 22.6l10.12-10.12v-.24L.6 2.12l-.1.35zM20.36 10.4l-2.72-1.56-3.08 3.08 3.08 3.08 2.75-1.58c.78-.45.78-1.58-.03-2.02zM3.18.24l12.27 7.03-2.76 2.76L2.26.27c.3-.16.63-.17.92-.03z"/>
                </svg>
                <div className="text-left">
                  <p className="text-white/50 text-xs leading-none mb-0.5">Get it on</p>
                  <p className="text-white font-semibold text-sm leading-none">Google Play</p>
                </div>
              </Link>
            </div>

            <p className="text-white/30 text-xs mt-4">Coming soon · join the waitlist above to get notified first</p>
          </div>

          {/* Phone mockup */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-56 h-[480px] rounded-[3rem] border-4 border-white/20 shadow-2xl overflow-hidden"
              style={{ backgroundColor: "#f4f6f9" }}>
              {/* Status bar */}
              <div className="h-8 flex items-center justify-between px-5" style={{ backgroundColor: "#0F3154" }}>
                <span className="text-white/60 text-xs">9:41</span>
                <div className="w-16 h-4 rounded-full bg-black/30 mx-auto absolute left-1/2 -translate-x-1/2" />
                <span className="text-white/60 text-xs">●●●</span>
              </div>
              {/* Mock app screen */}
              <div className="p-3 space-y-3">
                <div className="h-8 rounded-lg bg-white shadow-sm flex items-center px-3">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#DC373E" }} />
                  <div className="h-2 w-24 rounded bg-gray-200" />
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="h-1.5" style={{ backgroundColor: "#0F3154" }} />
                    <div className="p-3 space-y-1.5">
                      <div className="h-2.5 w-3/4 rounded bg-gray-200" />
                      <div className="h-2 w-1/2 rounded bg-gray-100" />
                      <div className="flex justify-between mt-2">
                        <div className="h-2 w-16 rounded bg-gray-100" />
                        <div className="h-5 w-14 rounded-full" style={{ backgroundColor: "#DC373E", opacity: 0.8 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute translate-x-20 translate-y-20 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2.5 max-w-[180px] border">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm"
                style={{ backgroundColor: "#f0f4f9" }}>⚡</div>
              <div>
                <p className="text-xs font-semibold leading-tight">1 spot just opened</p>
                <p className="text-xs text-muted-foreground">Tuesday Clinic · Cary</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
