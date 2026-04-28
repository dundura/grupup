"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Msg {
  id: number; fromClerkId: string; toClerkId: string;
  body: string; isRead: boolean; createdAt: string;
}

interface Thread {
  otherClerkId: string;
  otherName: string;
  otherPhoto: string;
  messages: Msg[];
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useUser();
  const [allMsgs, setAllMsgs] = useState<Msg[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, { name: string; photo: string }>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then(async (msgs: Msg[]) => {
        if (!Array.isArray(msgs)) return;
        setAllMsgs(msgs);

        // Collect unique other party IDs
        const otherIds = [...new Set(msgs.map((m) =>
          m.fromClerkId === user?.id ? m.toClerkId : m.fromClerkId
        ))];

        // Fetch profiles for each
        const profileMap: Record<string, { name: string; photo: string }> = {};
        await Promise.all(otherIds.map(async (id) => {
          try {
            const r = await fetch(`/api/user-profile?userId=${id}`);
            if (r.ok) profileMap[id] = await r.json();
          } catch { /* ignore */ }
        }));
        setProfiles(profileMap);

        // Group into threads
        const threadMap: Record<string, Msg[]> = {};
        for (const m of msgs) {
          const other = m.fromClerkId === user?.id ? m.toClerkId : m.fromClerkId;
          if (!threadMap[other]) threadMap[other] = [];
          threadMap[other].push(m);
        }
        const built: Thread[] = Object.entries(threadMap).map(([otherId, threadMsgs]) => ({
          otherClerkId: otherId,
          otherName: profileMap[otherId]?.name ?? "User",
          otherPhoto: profileMap[otherId]?.photo ?? "",
          messages: threadMsgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
          unreadCount: threadMsgs.filter((m) => m.toClerkId === user?.id && !m.isRead).length,
        }));
        built.sort((a, b) => new Date(b.messages[b.messages.length - 1].createdAt).getTime() - new Date(a.messages[a.messages.length - 1].createdAt).getTime());
        setThreads(built);
        if (built.length && !activeThread) setActiveThread(built[0].otherClerkId);
      });
  }, [user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread, allMsgs]);

  async function send() {
    if (!draft.trim() || !activeThread) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toClerkId: activeThread, body: draft.trim() }),
    });
    if (res.ok) {
      const newMsg: Msg = await res.json();
      setAllMsgs((prev) => [...prev, newMsg]);
      setThreads((prev) => prev.map((t) =>
        t.otherClerkId === activeThread ? { ...t, messages: [...t.messages, newMsg] } : t
      ));
      setDraft("");
    }
    setSending(false);
  }

  const activeMessages = threads.find((t) => t.otherClerkId === activeThread)?.messages ?? [];
  const activeName = profiles[activeThread ?? ""]?.name ?? "User";
  const activePhoto = profiles[activeThread ?? ""]?.photo ?? "";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      {threads.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">No messages yet.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex" style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
          {/* Thread list */}
          <div className="w-72 shrink-0 border-r overflow-y-auto">
            {threads.map((t) => (
              <button key={t.otherClerkId} onClick={() => setActiveThread(t.otherClerkId)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#f8fafc] transition-colors border-b"
                style={activeThread === t.otherClerkId ? { backgroundColor: "#f0f4f9" } : {}}>
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9]">
                  {t.otherPhoto ? (
                    <Image src={t.otherPhoto} alt={t.otherName} fill className="object-cover" sizes="40px" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: "#0F3154" }}>
                      {t.otherName[0]?.toUpperCase()}
                    </div>
                  )}
                  {t.unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: "#DC373E" }}>
                      {t.unreadCount}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{t.otherName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.messages[t.messages.length - 1]?.body}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Message pane */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b bg-[#f8fafc]">
              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-[#f0f4f9]">
                {activePhoto ? (
                  <Image src={activePhoto} alt={activeName} fill className="object-cover" sizes="36px" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: "#0F3154" }}>
                    {activeName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <p className="font-semibold text-sm">{activeName}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {activeMessages.map((m) => {
                const isMe = m.fromClerkId === user?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                      style={isMe
                        ? { backgroundColor: "#0F3154", color: "white", borderBottomRightRadius: 4 }
                        : { backgroundColor: "#f0f4f9", color: "#1a1a1a", borderBottomLeftRadius: 4 }}>
                      {m.body}
                      <p className="text-[10px] mt-1 opacity-60">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <div className="border-t px-4 py-3 flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Write a message…"
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-[#f8fafc]"
              />
              <Button size="sm" onClick={send} disabled={!draft.trim() || sending}
                style={{ backgroundColor: "#0F3154" }} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
