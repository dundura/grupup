"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BookButton({
  sessionId,
  disabled,
  label,
}: {
  sessionId: string;
  disabled: boolean;
  label: string;
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBook() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/sessions/${sessionId}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className="w-full text-white font-semibold"
      style={{ backgroundColor: disabled ? undefined : "#DC373E" }}
      disabled={disabled || loading}
      onClick={handleBook}
    >
      {loading ? "Redirecting to checkout…" : label}
    </Button>
  );
}
