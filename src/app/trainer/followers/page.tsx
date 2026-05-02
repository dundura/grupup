"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Follower {
  clerkId: string;
  name: string;
  email: string;
  photo: string;
}

export default function TrainerFollowersPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push("/sign-in"); return; }
    fetch("/api/trainer/message-followers")
      .then((r) => r.json())
      .then((data) => {
        setFollowers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoaded, isSignedIn, router]);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/trainer/message-followers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const d = await res.json();
      setSentMsg(`Sent to ${d.sent} ${d.sent === 1 ? "person" : "people"}`);
      setMessage(""); setSubject("");
      setTimeout(() => { setSentMsg(""); setModal(false); }, 2500);
    } finally {
      setSending(false);
    }
  }

  if (!isLoaded || loading) return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
      <p className="text-muted-foreground">Loading…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Followers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{followers.length} {followers.length === 1 ? "person follows" : "people follow"} you</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">← Dashboard</Link>
            {followers.length > 0 && (
              <Button onClick={() => { setModal(true); setSentMsg(""); }} style={{ backgroundColor: "#0F3154" }}>
                <Mail className="h-4 w-4 mr-2" /> Message all
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          {followers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold">No followers yet</p>
              <p className="text-sm text-muted-foreground mt-1">Share your profile to start building your audience.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs">Email</th>
                </tr>
              </thead>
              <tbody>
                {followers.map((f) => (
                  <tr key={f.clerkId} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {f.photo ? (
                          <Image src={f.photo} alt={f.name} width={32} height={32} className="rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-[#0F3154] flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">{f.name?.[0]}</span>
                          </div>
                        )}
                        <span className="font-medium">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{f.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Message modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Message all followers ({followers.length})</h3>
              <button onClick={() => setModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            {sentMsg ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">✅</div>
                <p className="font-semibold">{sentMsg}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Subject (optional)</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. New session available…" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                    rows={5} placeholder="Write your message…"
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
                  <Button className="flex-1" disabled={!message.trim() || sending}
                    style={{ backgroundColor: "#DC373E" }} onClick={handleSend}>
                    {sending ? "Sending…" : "Send"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
