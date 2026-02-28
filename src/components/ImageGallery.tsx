"use client";

import { useState } from "react";
import { ProjectImage } from "@/types/project";

interface Props {
  images: ProjectImage[];
}

export default function ImageGallery({ images }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted">
        <p>Henüz görsel eklenmemiş.</p>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="p-4">
      {/* Main Image */}
      <div className="relative mb-4 overflow-hidden rounded-lg bg-bg-primary border border-border">
        <div className="aspect-video w-full">
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-sm text-white">{selectedImage.alt}</p>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={() =>
                setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                index === selectedIndex
                  ? "border-accent-blue"
                  : "border-border hover:border-border-hover"
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-16 w-28 object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image counter */}
      <div className="mt-3 text-center text-xs text-text-muted">
        {selectedIndex + 1} / {images.length}
      </div>
    </div>
  );
}
