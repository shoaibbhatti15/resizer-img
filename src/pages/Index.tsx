import React, { useState, useCallback } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ResizeControls } from '@/components/ResizeControls';
import { ImagePreview } from '@/components/ImagePreview';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isResizing, setIsResizing] = useState(false);
  const [resizedImage, setResizedImage] = useState<Blob | null>(null);

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      setPreviewUrl(url);
    };
    img.src = url;
  };

  const handleResize = useCallback(async (width: number, height: number) => {
    if (!originalImage) return;
    
    setIsResizing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(originalImage, 0, 0, width, height);
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      setResizedImage(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (error) {
      toast.error('Error resizing image');
    } finally {
      setIsResizing(false);
    }
  }, [originalImage]);

  const handleDownload = useCallback(() => {
    if (!resizedImage) return;
    
    const url = URL.createObjectURL(resizedImage);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resized-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Image downloaded successfully!');
  }, [resizedImage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Image Resizer</h1>
            <p className="text-lg text-gray-600">
              Resize your images quickly and easily
            </p>
          </div>

          {!originalImage ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <div className="space-y-6">
              <ImagePreview imageUrl={previewUrl} isResizing={isResizing} />
              
              <ResizeControls
                originalWidth={originalImage.width}
                originalHeight={originalImage.height}
                onResize={handleResize}
              />

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOriginalImage(null);
                    setPreviewUrl('');
                    setResizedImage(null);
                  }}
                >
                  Upload New Image
                </Button>
                
                <Button
                  onClick={handleDownload}
                  disabled={!resizedImage}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Resized Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;