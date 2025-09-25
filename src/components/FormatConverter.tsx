import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ImageUploader';
import { ImagePreview } from '@/components/ImagePreview';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface FormatConverterProps {
  onReset?: () => void;
}

const SUPPORTED_FORMATS = [
  { value: 'image/jpeg', label: 'JPG', extension: 'jpg' },
  { value: 'image/png', label: 'PNG', extension: 'png' },
  { value: 'image/webp', label: 'WEBP', extension: 'webp' },
  { value: 'image/bmp', label: 'BMP', extension: 'bmp' },
];

export const FormatConverter = ({ onReset }: FormatConverterProps) => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<string>('image/jpeg');
  const [convertedImage, setConvertedImage] = useState<Blob | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [originalFormat, setOriginalFormat] = useState<string>('');

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setOriginalFormat(file.type);
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.onload = () => {
      setOriginalImage(img);
      setPreviewUrl(url);
      setConvertedImage(null);
    };
    img.src = url;
  };

  const handleConvert = useCallback(async () => {
    if (!originalImage) return;
    
    if (originalFormat === targetFormat) {
      toast.info('Source and target formats are the same');
      return;
    }

    setIsConverting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // For PNG to JPG conversion, add white background
      if (targetFormat === 'image/jpeg' && originalFormat !== 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(originalImage, 0, 0);
      
      const quality = targetFormat === 'image/jpeg' ? 0.9 : undefined;
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, targetFormat, quality);
      });

      setConvertedImage(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      
      const targetExt = SUPPORTED_FORMATS.find(f => f.value === targetFormat)?.extension || 'converted';
      const originalExt = SUPPORTED_FORMATS.find(f => f.value === originalFormat)?.label || 'image';
      
      toast.success(`Successfully converted ${originalExt} to ${targetExt.toUpperCase()}!`);
    } catch (error) {
      toast.error('Error converting image format');
      console.error(error);
    } finally {
      setIsConverting(false);
    }
  }, [originalImage, targetFormat, originalFormat]);

  const handleDownload = useCallback(() => {
    if (!convertedImage) return;
    
    const url = URL.createObjectURL(convertedImage);
    const a = document.createElement('a');
    const targetExt = SUPPORTED_FORMATS.find(f => f.value === targetFormat)?.extension || 'converted';
    
    a.href = url;
    a.download = `converted-image.${targetExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Converted image downloaded successfully!');
  }, [convertedImage, targetFormat]);

  const handleReset = () => {
    setOriginalImage(null);
    setPreviewUrl('');
    setConvertedImage(null);
    setOriginalFormat('');
    if (onReset) onReset();
  };

  if (!originalImage) {
    return <ImageUploader onImageUpload={handleFileUpload} />;
  }

  return (
    <div className="space-y-6">
      <ImagePreview imageUrl={previewUrl} isResizing={isConverting} />
      
      <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Format Conversion</h3>
          <p className="text-sm text-gray-500">
            Convert your image to a different format
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">From:</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">
                {SUPPORTED_FORMATS.find(f => f.value === originalFormat)?.label || 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">To:</label>
            <Select value={targetFormat} onValueChange={setTargetFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          onClick={handleConvert}
          className="w-full gap-2"
          disabled={isConverting || originalFormat === targetFormat}
        >
          <RefreshCw className={`w-4 h-4 ${isConverting ? 'animate-spin' : ''}`} />
          {isConverting ? 'Converting...' : 'Convert Format'}
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleReset}>
          Upload New File
        </Button>
        
        <Button
          onClick={handleDownload}
          disabled={!convertedImage}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download Converted Image
        </Button>
      </div>
    </div>
  );
};