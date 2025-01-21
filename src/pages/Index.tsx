import React, { useState, useCallback } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ResizeControls } from '@/components/ResizeControls';
import { ImagePreview } from '@/components/ImagePreview';
import { Button } from '@/components/ui/button';
import { Download, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isResizing, setIsResizing] = useState(false);
  const [resizedImage, setResizedImage] = useState<Blob | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      setFileType('image');
      const url = URL.createObjectURL(file);
      const img = document.createElement('img');
      img.onload = () => {
        setOriginalImage(img);
        setPreviewUrl(url);
      };
      img.src = url;
    } else if (file.type.startsWith('video/')) {
      setFileType('video');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast.info('Video conversion support coming soon!');
    }
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
      toast.success('Image resized successfully!');
    } catch (error) {
      toast.error('Error resizing image');
      console.error(error);
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
            <h1 className="text-4xl font-bold text-gray-900">Media Converter</h1>
            <p className="text-lg text-gray-600">
              Resize and convert your images and videos easily
            </p>
          </div>

          {/* Top Advertisement Space */}
          <div className="w-full h-[120px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Advertisement Space</p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload & Resize
              </TabsTrigger>
              <TabsTrigger value="convert" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Convert Format
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              {!originalImage ? (
                <ImageUploader onImageUpload={handleFileUpload} />
              ) : (
                <div className="space-y-6">
                  <ImagePreview imageUrl={previewUrl} isResizing={isResizing} />
                  
                  {fileType === 'image' && (
                    <ResizeControls
                      originalWidth={originalImage.width}
                      originalHeight={originalImage.height}
                      onResize={handleResize}
                    />
                  )}

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOriginalImage(null);
                        setPreviewUrl('');
                        setResizedImage(null);
                      }}
                    >
                      Upload New File
                    </Button>
                    
                    {fileType === 'image' && (
                      <Button
                        onClick={handleDownload}
                        disabled={!resizedImage}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Resized Image
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="convert">
              <div className="p-6 text-center bg-white rounded-lg border">
                <p className="text-gray-600">Format conversion coming soon!</p>
                <p className="text-sm text-gray-500 mt-2">
                  We'll support converting between different image and video formats.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Bottom Advertisement Space */}
          <div className="w-full h-[120px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Advertisement Space</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;