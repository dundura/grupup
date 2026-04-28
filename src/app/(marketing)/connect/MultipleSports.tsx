"use client";

import { useState, useRef, useEffect } from "react";

export function MultipleSports({ sports }: { sports: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <span ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="underline underline-offset-2 decoration-dotted cursor-pointer">
        Multiple ▾
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 px-1 min-w-[140px]">
          {sports.map((s) => (
            <div key={s} className="px-3 py-1 text-xs font-medium text-[#0F3154] whitespace-nowrap">{s}</div>
          ))}
        </div>
      )}
    </span>
  );
}
