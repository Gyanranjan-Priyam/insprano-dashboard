"use client";

import { useState } from "react";
import { FileImageIcon, AlertCircleIcon } from "lucide-react";

interface PaymentImageProps {
  src: string;
  alt: string;
  fileName: string;
  className?: string;
}

export function PaymentImage({ src, alt, fileName, className = "" }: PaymentImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    // console.log("Image failed to load:", src);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    // console.log("Image loaded successfully:", src);
    setImageLoading(false);
    setImageError(false);
  };

  // console.log("PaymentImage props:", { src, fileName });

  if (imageError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-8 border rounded-lg bg-muted/50">
        <AlertCircleIcon className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground mb-2" />
        <p className="text-xs md:text-sm text-muted-foreground text-center">
          Unable to load payment screenshot
        </p>
        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 wrap-break-word text-center">
          File: {fileName}
        </p>
        <p className="text-[10px] md:text-xs text-red-500 mt-1 wrap-break-word text-center">
          Path: {src}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {imageLoading && (
        <div className="flex items-center justify-center p-4 md:p-8 border rounded-lg bg-muted/50">
          <div className="animate-pulse flex flex-col items-center">
            <FileImageIcon className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground mb-2" />
            <p className="text-xs md:text-sm text-muted-foreground text-center">Loading image...</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 wrap-break-word text-center">
              Trying to load: {src}
            </p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoading ? 'hidden' : 'block'} w-full max-w-sm rounded-lg border`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      <p className="text-[10px] md:text-xs text-muted-foreground wrap-break-word">
        File: {fileName}
      </p>
    </div>
  );
}