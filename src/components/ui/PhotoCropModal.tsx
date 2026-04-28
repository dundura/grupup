"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Area } from "react-easy-crop";
import { X, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Button } from "./button";

const Cropper = dynamic(() => import("react-easy-crop"), { ssr: false });

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height,
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas empty")), "image/jpeg", 0.95)
  );
}

export function PhotoCropModal({
  imageSrc,
  onApply,
  onCancel,
}: {
  imageSrc: string;
  onApply: (blob: Blob) => Promise<void>;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  async function handleApply() {
    if (!croppedArea) return;
    setApplying(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea);
      await onApply(blob);
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-lg">Crop & position photo</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative w-full" style={{ height: 320, backgroundColor: "#111" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-5 py-4 flex items-center gap-3 border-b">
          <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[#0F3154]"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
        <p className="text-center text-xs text-muted-foreground pb-2">Drag to reposition · scroll to zoom</p>

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={applying}>Cancel</Button>
          <Button className="flex-1" onClick={handleApply} disabled={applying} style={{ backgroundColor: "#DC373E" }}>
            {applying ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Applying…</> : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
