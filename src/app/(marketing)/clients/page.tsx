"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, X, ArrowLeft, Users, ChevronRight } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  sport: string | null;
  level: string | null;
  groupTag: string | null;
  team: string | null;
  position: string | null;
  notes: string | null;
  createdAt: string;
}

const EMPTY_FORM = { name: "", email: "", phone: "", sport: "", level: "", groupTag: "", team: "", position: "", notes: "" };
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];

export default function ClientsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [modal, setModal] = useState<{ id?: number } & typeof EMPTY_FORM | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
  const [savingNotes, setSavingNotes] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.replace("/dashboard"); return; }
    fetch("/api/crm/clients")
      .then((r) => r.json())
      .then((data) => { setClients(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isLoaded, user, router]);

  const groups = useMemo(() => {
    const tags = new Set(clients.map((c) => c.groupTag).filter(Boolean) as string[]);
    return [...tags].sort();
  }, [clients]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !(c.email ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filterGroup && c.groupTag !== filterGroup) return false;
      return true;
    });
  }, [clients, search, filterGroup]);

  function openAdd() { setModal({ ...EMPTY_FORM }); }
  function openEdit(c: Client) {
    setModal({ id: c.id, name: c.name, email: c.email ?? "", phone: c.phone ?? "", sport: c.sport ?? "", level: c.level ?? "", groupTag: c.groupTag ?? "", team: c.team ?? "", position: c.position ?? "", notes: c.notes ?? "" });
  }

  async function handleSave() {
    if (!modal || !modal.name.trim()) return;
    setSaving(true);
    try {
      const isEdit = !!modal.id;
      const url = isEdit ? `/api/crm/clients/${modal.id}` : "/api/crm/clients";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modal),
      });
      const saved: Client = await res.json();
      setClients((prev) => isEdit ? prev.map((c) => c.id === saved.id ? saved : c) : [saved, ...prev]);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this client?")) return;
    await fetch(`/api/crm/clients/${id}`, { method: "DELETE" });
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  async function commitNotes(client: Client) {
    const notes = editingNotes[client.id] ?? client.notes ?? "";
    setSavingNotes(client.id);
    const res = await fetch(`/api/crm/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...client, notes }),
    });
    const updated: Client = await res.json();
    setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setEditingNotes((prev) => { const n = { ...prev }; delete n[client.id]; return n; });
    setSavingNotes(null);
  }

  if (!isLoaded || loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-gray-400">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <div style={{ backgroundColor: "#0F3154" }} className="px-4 py-6">
        <div className="container max-w-5xl">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-xs mb-4 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-white/70" />
              <h1 className="text-xl font-bold text-white">My Clients</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white/80">{clients.length}</span>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#DC373E" }}
            >
              <Plus className="h-4 w-4" /> Add Client
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-6 space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20 shadow-sm"
            />
          </div>
          {groups.length > 0 && (
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20 shadow-sm"
            >
              <option value="">All groups</option>
              {groups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
          {(search || filterGroup) && (
            <button onClick={() => { setSearch(""); setFilterGroup(""); }} className="text-xs text-gray-400 hover:text-gray-700 font-medium flex items-center gap-1">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">👥</div>
            <p className="font-semibold text-lg mb-1">{clients.length === 0 ? "No clients yet" : "No matches"}</p>
            <p className="text-sm text-gray-400 mb-6">
              {clients.length === 0 ? "Add your first client to start tracking your roster." : "Try a different search or group."}
            </p>
            {clients.length === 0 && (
              <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90" style={{ backgroundColor: "#DC373E" }}>
                <Plus className="h-4 w-4" /> Add your first client
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Contact</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Sport / Level</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Group</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden lg:table-cell">Notes</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <>
                    <tr
                      key={c.id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: "#0F3154" }}>
                            {c.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{c.name}</p>
                            {(c.team || c.position) && (
                              <p className="text-xs text-gray-400">{[c.position, c.team].filter(Boolean).join(" · ")}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.email && <p className="truncate max-w-[160px]">{c.email}</p>}
                        {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                        {!c.email && !c.phone && <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                        {c.sport || c.level ? (
                          <span>{[c.sport, c.level].filter(Boolean).join(" · ")}</span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {c.groupTag
                          ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0F3154]/10 text-[#0F3154]">{c.groupTag}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-400 max-w-[200px]">
                        <span className="truncate block">{c.notes || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="text-xs font-semibold text-[#0F3154] hover:underline mr-3">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="text-xs font-semibold text-red-400 hover:text-red-600">Delete</button>
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr key={`${c.id}-expanded`} className="bg-gray-50 border-t border-gray-100">
                        <td colSpan={6} className="px-6 py-4">
                          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Notes</p>
                          <textarea
                            value={editingNotes[c.id] ?? (c.notes ?? "")}
                            onChange={(e) => setEditingNotes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                            placeholder="Add notes about this client..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20 resize-none"
                          />
                          {editingNotes[c.id] !== undefined && editingNotes[c.id] !== (c.notes ?? "") && (
                            <button
                              onClick={() => commitNotes(c)}
                              disabled={savingNotes === c.id}
                              className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                              style={{ backgroundColor: "#0F3154" }}
                            >
                              {savingNotes === c.id ? "Saving..." : "Save Notes"}
                            </button>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {filtered.length !== clients.length && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                Showing {filtered.length} of {clients.length} clients
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{modal.id ? "Edit Client" : "Add Client"}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Name *</label>
                <input autoFocus value={modal.name} onChange={(e) => setModal((m) => m ? { ...m, name: e.target.value } : m)}
                  placeholder="Client name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
                  <input type="email" value={modal.email} onChange={(e) => setModal((m) => m ? { ...m, email: e.target.value } : m)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone</label>
                  <input value={modal.phone} onChange={(e) => setModal((m) => m ? { ...m, phone: e.target.value } : m)}
                    placeholder="555-000-0000"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Team / School</label>
                  <input value={modal.team} onChange={(e) => setModal((m) => m ? { ...m, team: e.target.value } : m)}
                    placeholder="e.g. Northern High School"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Position</label>
                  <input value={modal.position} onChange={(e) => setModal((m) => m ? { ...m, position: e.target.value } : m)}
                    placeholder="e.g. Midfielder"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Sport</label>
                  <input value={modal.sport} onChange={(e) => setModal((m) => m ? { ...m, sport: e.target.value } : m)}
                    placeholder="e.g. Soccer"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Level</label>
                  <select value={modal.level} onChange={(e) => setModal((m) => m ? { ...m, level: e.target.value } : m)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20 bg-white">
                    <option value="">Select level</option>
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Group / Tag</label>
                <input value={modal.groupTag} onChange={(e) => setModal((m) => m ? { ...m, groupTag: e.target.value } : m)}
                  placeholder="e.g. Competitive, Youth, Adults..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20"
                  list="group-suggestions" />
                {groups.length > 0 && <datalist id="group-suggestions">{groups.map((g) => <option key={g} value={g} />)}</datalist>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Notes</label>
                <textarea value={modal.notes} onChange={(e) => setModal((m) => m ? { ...m, notes: e.target.value } : m)}
                  placeholder="Any notes about this client..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200">Cancel</button>
              <button onClick={handleSave} disabled={saving || !modal.name.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "#0F3154" }}>
                {saving ? "Saving..." : modal.id ? "Save Changes" : "Add Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
