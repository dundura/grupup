"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Archive, ArchiveRestore, Search } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  photo: string;
  role: string;
  joinedAt: string;
  sessionCount: number;
  bookingCount: number;
  archived: boolean;
}

export default function AdminClient({ trainers, players }: { trainers: AdminUser[]; players: AdminUser[] }) {
  const [tab, setTab] = useState<"trainers" | "players">("trainers");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState({ trainers, players });
  const [confirming, setConfirming] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const list = (tab === "trainers" ? users.trainers : users.players)
    .filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  async function handleArchive(userId: string, archived: boolean) {
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    setUsers((prev) => ({
      trainers: prev.trainers.map((u) => u.id === userId ? { ...u, archived } : u),
      players: prev.players.map((u) => u.id === userId ? { ...u, archived } : u),
    }));
    setLoading(null);
  }

  async function handleDelete(userId: string) {
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setUsers((prev) => ({
      trainers: prev.trainers.filter((u) => u.id !== userId),
      players: prev.players.filter((u) => u.id !== userId),
    }));
    setConfirming(null);
    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Admin</h1>
          <p className="text-muted-foreground text-sm">{users.trainers.length} trainers · {users.players.length} players</p>
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex gap-2">
            {(["trainers", "players"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors"
                style={tab === t ? { backgroundColor: "#0F3154", color: "white" } : { backgroundColor: "white", color: "#0F3154", border: "1px solid #0F3154" }}>
                {t} ({t === "trainers" ? users.trainers.length : users.players.length})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9 pr-4 py-2 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring w-64" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {list.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">No {tab} found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-[#f7f8fa]">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Joined</th>
                  <th className="text-center px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">
                    {tab === "trainers" ? "Sessions" : "Bookings"}
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((u) => (
                  <tr key={u.id} className={u.archived ? "opacity-50" : ""}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-muted">
                          {u.photo ? (
                            <Image src={u.photo} alt={u.name} fill className="object-cover" sizes="32px" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#0F3154" }}>
                              {u.name?.[0] ?? "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{u.name} {u.archived && <span className="text-xs text-muted-foreground">(archived)</span>}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                      {new Date(u.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      <span className="font-semibold">{tab === "trainers" ? u.sessionCount : u.bookingCount}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleArchive(u.id, !u.archived)}
                          disabled={loading === u.id}
                          title={u.archived ? "Unarchive" : "Archive"}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-amber-50 hover:border-amber-300 transition-colors">
                          {u.archived
                            ? <ArchiveRestore className="h-3.5 w-3.5 text-amber-500" />
                            : <Archive className="h-3.5 w-3.5 text-amber-500" />}
                        </button>
                        {confirming === u.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(u.id)} disabled={loading === u.id}
                              className="text-xs font-semibold text-white px-2 py-1 rounded-lg" style={{ backgroundColor: "#DC373E" }}>
                              {loading === u.id ? "…" : "Confirm"}
                            </button>
                            <button onClick={() => setConfirming(null)} className="text-xs text-muted-foreground px-2 py-1 rounded-lg border">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirming(u.id)}
                            title="Delete user"
                            className="flex items-center justify-center w-8 h-8 rounded-lg border hover:bg-red-50 hover:border-red-300 transition-colors">
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
