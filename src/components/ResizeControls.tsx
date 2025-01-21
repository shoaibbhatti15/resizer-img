import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResizeControlsProps {
  originalWidth: number;
  originalHeight: number;
  onResize: (width: number, height: number) => void;
}

export const ResizeControls = ({ originalWidth, originalHeight, onResize }: ResizeControlsProps) => {
  const [width, setWidth] = useState(originalWidth);
  const [height, setHeight] = useState(originalHeight);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [percentage, setPercentage] = useState(100);
  const aspectRatio = originalWidth / originalHeight;

  useEffect(() => {
    setWidth(originalWidth);
    setHeight(originalHeight);
    setPercentage(100);
  }, [originalWidth, originalHeight]);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (aspectLocked) {
      const newHeight = Math.round(newWidth / aspectRatio);
      setHeight(newHeight);
      setPercentage((newWidth / originalWidth) * 100);
    }
    onResize(newWidth, aspectLocked ? Math.round(newWidth / aspectRatio) : height);
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (aspectLocked) {
      const newWidth = Math.round(newHeight * aspectRatio);
      setWidth(newWidth);
      setPercentage((newHeight / originalHeight) * 100);
    }
    onResize(aspectLocked ? Math.round(newHeight * aspectRatio) : width, newHeight);
  };

  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    const newWidth = Math.round((originalWidth * newPercentage) / 100);
    const newHeight = Math.round((originalHeight * newPercentage) / 100);
    setWidth(newWidth);
    setHeight(newHeight);
    onResize(newWidth, newHeight);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Resize Image</h3>
        <p className="text-sm text-gray-500">Original size: {originalWidth} × {originalHeight}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Width</label>
            <Input
              type="number"
              min="1"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mt-6"
            onClick={() => setAspectLocked(!aspectLocked)}
          >
            {aspectLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Height</label>
            <Input
              type="number"
              min="1"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Scale percentage</label>
          <Input
            type="number"
            min="1"
            max="200"
            value={percentage}
            onChange={(e) => handlePercentageChange(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
    </div>
  );
};