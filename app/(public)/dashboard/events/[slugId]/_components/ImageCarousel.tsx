"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// Helper function to construct full URL (moved to client component)
const getFileUrl = (key: string) => {
  if (!key) return '';
  // If it's already a full URL, return as is
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  // Otherwise, construct the full URL
  return `https://registration.t3.storage.dev/${key}`;
};

interface ImageCarouselProps {
  images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
        <Image
          src={getFileUrl(images[0])}
          alt="Event image"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          priority
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image Display */}
      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group">
        <Image
          src={getFileUrl(images[currentIndex])}
          alt={`Event image ${currentIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          priority
        />
        
        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Previous image"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Next image"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* Image Counter */}
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`relative shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all duration-200 ${
              index === currentIndex 
                ? 'border-primary shadow-md' 
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <Image
              src={getFileUrl(image)}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="64px"
              priority
            />
            {index === currentIndex && (
              <div className="absolute inset-0 bg-primary/20" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}