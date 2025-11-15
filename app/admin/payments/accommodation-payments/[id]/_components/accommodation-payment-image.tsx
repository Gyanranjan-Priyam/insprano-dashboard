"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLinkIcon, DownloadIcon } from "lucide-react";
import Image from "next/image";

interface AccommodationPaymentImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function AccommodationPaymentImage({ src, alt, className }: AccommodationPaymentImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `payment-screenshot-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    window.open(src, '_blank');
  };

  if (imageError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center min-h-[200px] border border-dashed border-gray-300 rounded-lg`}>
        <div className="text-center p-4">
          <p className="text-sm text-gray-500 mb-2">Unable to load image</p>
          <Button 
            onClick={handleOpenExternal}
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            <ExternalLinkIcon className="w-3 h-3 mr-1" />
            Open Original
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}>
            <Image
              src={src}
              alt={alt}
              width={400}
              height={300}
              className="w-full h-auto object-contain rounded-lg border"
              onError={() => setImageError(true)}
              priority
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Image
              src={src}
              alt={alt}
              width={800}
              height={600}
              className="max-w-full h-auto object-contain"
              onError={() => setImageError(true)}
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={handleOpenExternal}
          variant="outline" 
          size="sm"
          className="text-xs flex-1"
        >
          <ExternalLinkIcon className="w-3 h-3 mr-1" />
          Open External
        </Button>
        <Button 
          onClick={handleDownload}
          variant="outline" 
          size="sm"
          className="text-xs flex-1"
        >
          <DownloadIcon className="w-3 h-3 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );
}