"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onUploaded: (url: string) => void;
  currentUrl?: string;
  label?: string;
}

export function ImageUpload({ onUploaded, currentUrl, label = "Upload photo" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(currentUrl ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10 MB."); return; }

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to get upload URL");

      const putRes = await fetch(json.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload failed");

      setPreview(json.cdnUrl);
      onUploaded(json.cdnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {preview && (
        <div className="flex items-center gap-3">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
            <Image src={preview} alt="Profile photo" fill className="object-cover" sizes="80px" unoptimized />
          </div>
          <div>
            <p className="text-sm font-medium">Photo uploaded</p>
            <button type="button" onClick={() => inputRef.current?.click()}
              className="text-xs text-[#DC373E] hover:underline">Change photo</button>
          </div>
        </div>
      )}

      {!preview && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragOver ? "border-[#0F3154] bg-[#f0f4f9]" : "border-border hover:border-[#0F3154]/50"
          }`}
        >
          {uploading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Uploading…</p>
          ) : (
            <div>
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold" style={{ color: "#0F3154" }}>{label}</span>
                <br />
                <span className="text-xs">JPEG, PNG, WebP · Max 10 MB</span>
              </p>
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
