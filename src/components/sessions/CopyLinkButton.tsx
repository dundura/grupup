"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold border transition-colors hover:bg-muted"
      style={{ color: "#0F3154", borderColor: "#0F3154" }}>
      {copied ? (
        <><Check className="h-4 w-4 text-green-600" /><span className="text-green-600">Link copied!</span></>
      ) : (
        <><Link2 className="h-4 w-4" /> Invite Friends</>
      )}
    </button>
  );
}
