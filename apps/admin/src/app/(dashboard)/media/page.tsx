"use client";

import React, { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Copy, Trash2, Check } from "lucide-react";
import { Button } from "@reborn/ui";

interface MediaFile { id: string; name: string; url: string; mimeType: string; width?: number; height?: number; folder?: string; createdAt: string; }

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/media").then((r) => r.json()).then((d) => { setFiles(d.files || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      await fetch("/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file: base64, name: file.name }) });
      load();
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteFile = async (id: string) => {
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="flex flex-col">
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center justify-between px-6">
        <h1 className="font-heading text-lg font-bold text-charcoal">Media Library</h1>
        <label className="flex items-center gap-2 h-9 px-4 rounded-xl bg-bloom-rose text-white text-sm font-medium font-body hover:bg-bloom-rose-600 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : "Upload Image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-charcoal-100 animate-skeleton" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-charcoal-200 py-20 text-center">
            <ImageIcon className="w-12 h-12 text-taupe-300 mx-auto mb-3" />
            <p className="text-charcoal font-medium font-body">No images yet</p>
            <p className="text-sm text-taupe font-body mt-1">Upload your first image using the button above</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <div key={file.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-soft-blush-100 border border-charcoal-100">
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button onClick={() => copyUrl(file.id, file.url)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-charcoal hover:bg-ivory transition-colors" title="Copy URL">
                    {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => deleteFile(file.id)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-charcoal/70 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[10px] truncate font-body">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
