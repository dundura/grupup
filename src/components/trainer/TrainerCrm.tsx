"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, X, ChevronDown, ChevronUp, Pencil, Trash2, Users } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  sport: string | null;
  level: string | null;
  groupTag: string | null;
  notes: string | null;
  createdAt: string;
}

const EMPTY_FORM = { name: "", email: "", phone: "", sport: "", level: "", groupTag: "", notes: "" };
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Elite"];

export default function TrainerCrm() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [modal, setModal] = useState<{ id?: number } & typeof EMPTY_FORM | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/crm/clients")
      .then((r) => r.json())
      .then((data) => { setClients(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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

  function openAdd() {
    setModal({ ...EMPTY_FORM });
  }

  function openEdit(c: Client) {
    setModal({ id: c.id, name: c.name, email: c.email ?? "", phone: c.phone ?? "", sport: c.sport ?? "", level: c.level ?? "", groupTag: c.groupTag ?? "", notes: c.notes ?? "" });
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
      if (isEdit) {
        setClients((prev) => prev.map((c) => c.id === saved.id ? saved : c));
      } else {
        setClients((prev) => [saved, ...prev]);
      }
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

  async function saveNotes(client: Client, notes: string) {
    const res = await fetch(`/api/crm/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...client, notes }),
    });
    const updated: Client = await res.json();
    setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c));
  }

  return (
    <div className="bg-white rounded-2xl border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          <Users className="h-5 w-5" style={{ color: "#DC373E" }} />
          <h2 className="text-base font-bold">My Clients</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-1">
            {clients.length}
          </span>
          {collapsed
            ? <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
            : <ChevronUp className="h-4 w-4 text-muted-foreground ml-1" />}
        </button>
        <button
          onClick={openAdd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#DC373E" }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Client
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Filters */}
          <div className="flex gap-2 mt-4 mb-3 flex-wrap">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20"
              />
            </div>
            {groups.length > 0 && (
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20 bg-white"
              >
                <option value="">All groups</option>
                {groups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👥</div>
              <p className="font-semibold mb-1">{clients.length === 0 ? "No clients yet" : "No matches"}</p>
              <p className="text-sm text-muted-foreground">
                {clients.length === 0 ? "Add your first client to get started." : "Try a different search or group."}
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              {filtered.map((c) => (
                <ClientRow
                  key={c.id}
                  client={c}
                  expanded={expandedId === c.id}
                  onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  onEdit={() => openEdit(c)}
                  onDelete={() => handleDelete(c.id)}
                  onSaveNotes={(notes) => saveNotes(c, notes)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{modal.id ? "Edit Client" : "Add Client"}</h3>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Name *</label>
                <input
                  value={modal.name}
                  onChange={(e) => setModal((m) => m ? { ...m, name: e.target.value } : m)}
                  placeholder="Client name"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email</label>
                  <input
                    type="email"
                    value={modal.email}
                    onChange={(e) => setModal((m) => m ? { ...m, email: e.target.value } : m)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Phone</label>
                  <input
                    value={modal.phone}
                    onChange={(e) => setModal((m) => m ? { ...m, phone: e.target.value } : m)}
                    placeholder="555-000-0000"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Sport</label>
                  <input
                    value={modal.sport}
                    onChange={(e) => setModal((m) => m ? { ...m, sport: e.target.value } : m)}
                    placeholder="e.g. Soccer"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Level</label>
                  <select
                    value={modal.level}
                    onChange={(e) => setModal((m) => m ? { ...m, level: e.target.value } : m)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20 bg-white"
                  >
                    <option value="">Select level</option>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Group / Tag</label>
                <input
                  value={modal.groupTag}
                  onChange={(e) => setModal((m) => m ? { ...m, groupTag: e.target.value } : m)}
                  placeholder="e.g. Competitive, Youth, Adults..."
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20"
                  list="group-suggestions"
                />
                {groups.length > 0 && (
                  <datalist id="group-suggestions">
                    {groups.map((g) => <option key={g} value={g} />)}
                  </datalist>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes</label>
                <textarea
                  value={modal.notes}
                  onChange={(e) => setModal((m) => m ? { ...m, notes: e.target.value } : m)}
                  placeholder="Any notes about this client..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !modal.name.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "#0F3154" }}
              >
                {saving ? "Saving..." : modal.id ? "Save Changes" : "Add Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientRow({
  client, expanded, onToggle, onEdit, onDelete, onSaveNotes,
}: {
  client: Client;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSaveNotes: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(client.notes ?? "");
  const [noteDirty, setNoteDirty] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setNotes(client.notes ?? "");
    setNoteDirty(false);
  }, [client.notes]);

  async function commitNotes() {
    setSavingNotes(true);
    await onSaveNotes(notes);
    setSavingNotes(false);
    setNoteDirty(false);
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: "#0F3154" }}
        >
          {client.name[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">{client.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {[client.email, client.phone, client.sport, client.level].filter(Boolean).join(" · ") || "No details"}
          </p>
        </div>

        {client.groupTag && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0F3154]/10 text-[#0F3154] shrink-0">
            {client.groupTag}
          </span>
        )}

        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t bg-gray-50/50 pt-3 space-y-3">
          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setNoteDirty(true); }}
              placeholder="Add notes about this client..."
              rows={3}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3154]/20 resize-none"
            />
            {noteDirty && (
              <button
                onClick={commitNotes}
                disabled={savingNotes}
                className="mt-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: "#0F3154" }}
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex items-center gap-1 text-xs font-medium text-[#0F3154] hover:underline"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline ml-2"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
