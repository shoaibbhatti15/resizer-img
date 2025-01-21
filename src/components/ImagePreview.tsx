import React from 'react';
import { Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  isResizing: boolean;
}

export const ImagePreview = ({ imageUrl, isResizing }: ImagePreviewProps) => {
  return (
    <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      {isResizing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
      <img
        src={imageUrl}
        alt="Preview"
        className="w-full h-full object-contain"
      />
    </div>
  );
};