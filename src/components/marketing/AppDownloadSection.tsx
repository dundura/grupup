export function AppDownloadSection() {
  return (
    <section className="py-20 px-4" style={{ backgroundColor: "#0F3154" }}>
      <div className="container max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: "rgba(220,55,62,0.20)", color: "#f87171" }}>
              📱 Add to your home screen — free
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Train together.<br />On the go.
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Grupup works like a native app — add it to your home screen in seconds.
              Book sessions, join pickup games, and get spot notifications right on your phone.
            </p>

            <div className="space-y-4">
              {/* iOS instructions */}
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <span className="text-base"></span> iPhone / iPad
                </p>
                <p className="text-white/50 text-sm">
                  Open in Safari → tap <strong className="text-white/70">Share</strong> → tap <strong className="text-white/70">Add to Home Screen</strong>
                </p>
              </div>

              {/* Android instructions */}
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <span className="text-base">🤖</span> Android
                </p>
                <p className="text-white/50 text-sm">
                  Open in Chrome → tap <strong className="text-white/70">⋮ menu</strong> → tap <strong className="text-white/70">Add to Home screen</strong>
                  {" "}— or tap <strong className="text-white/70">Install</strong> when the banner appears
                </p>
              </div>
            </div>

            <p className="text-white/30 text-xs mt-5">
              Works offline · No app store needed · Instant updates
            </p>
          </div>

          {/* Phone mockup */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-56 h-[480px] rounded-[3rem] border-4 border-white/20 shadow-2xl overflow-hidden"
              style={{ backgroundColor: "#f4f6f9" }}>
              <div className="h-8 flex items-center justify-between px-5 relative" style={{ backgroundColor: "#0F3154" }}>
                <span className="text-white/60 text-xs">9:41</span>
                <div className="w-16 h-4 rounded-full bg-black/30 absolute left-1/2 -translate-x-1/2" />
                <span className="text-white/60 text-xs">●●●</span>
              </div>
              <div className="p-3 space-y-3">
                <div className="h-8 rounded-lg bg-white shadow-sm flex items-center px-3 gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#DC373E" }} />
                  <div className="h-2 w-16 rounded bg-gray-200" />
                  <div className="ml-auto h-5 w-5 rounded-full bg-gray-200" />
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="h-1.5" style={{ backgroundColor: "#0F3154" }} />
                    <div className="p-3 space-y-2">
                      <div className="h-2.5 w-3/4 rounded bg-gray-200" />
                      <div className="h-2 w-1/2 rounded bg-gray-100" />
                      <div className="flex justify-between items-center mt-1">
                        <div className="h-2 w-14 rounded bg-gray-100" />
                        <div className="h-6 w-16 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: "#DC373E", opacity: 0.85, fontSize: 9 }}>
                          Book
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute right-0 bottom-20 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2.5 max-w-[175px] border">
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
