"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type ImageDropzoneProps = {
  label: string;
  file: File | null;
  currentImageUrl?: string | null;
  onFileChange: (file: File | null) => void;
};

export function ImageDropzone({
  label,
  file,
  currentImageUrl = null,
  onFileChange,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = useMemo(() => {
    if (!file) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function openPicker() {
    inputRef.current?.click();
  }

  function handleSelectedFile(nextFile: File | null) {
    if (!nextFile) {
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      return;
    }

    onFileChange(nextFile);
  }

  return (
    <div className="space-y-2">
      <span className="text-xs uppercase tracking-[0.2em] text-stone-800/70">{label}</span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => handleSelectedFile(event.target.files?.[0] ?? null)}
        className="hidden"
      />

      <button
        type="button"
        onClick={openPicker}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleSelectedFile(event.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex w-full flex-col items-center justify-center gap-3 border border-dashed px-4 py-5 text-center transition ${
          isDragging
            ? "border-amber-900 bg-amber-100/70"
            : "border-amber-950/30 bg-white/50 hover:bg-white/60"
        }`}
      >
        <div className="relative h-28 w-28 overflow-hidden border-[3px] border-amber-950/35 bg-[radial-gradient(circle_at_30%_30%,#f6ead1,#d0b07b_58%,#8f6539)]">
          {previewUrl ? (
            <Image src={previewUrl} alt="Vista previa" fill unoptimized className="object-cover" />
          ) : currentImageUrl ? (
            <Image src={currentImageUrl} alt="Imagen actual" fill sizes="112px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-xs uppercase tracking-[0.16em] text-stone-800/70">
              Sin imagen
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-stone-900">
            Arrastra una imagen aqui o haz clic para subirla
          </p>
          <p className="text-xs leading-5 text-stone-800/70">
            Se guardara dentro de Supabase Storage y ya no dependera de URLs externas.
          </p>
        </div>
      </button>

      {file ? (
        <div className="flex items-center justify-between gap-3 text-xs text-stone-800/75">
          <span className="truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="border border-amber-950/25 px-3 py-2 uppercase tracking-[0.16em] transition hover:bg-stone-900/5"
          >
            Quitar
          </button>
        </div>
      ) : null}
    </div>
  );
}
