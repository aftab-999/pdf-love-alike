
import React from 'react';
import { FileDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  formatFileSize, 
  getCompressionForExactTargetSize,
  calculateEstimatedSize
} from '@/lib/fileUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CompressionSettingsProps {
  compressionPercentage: number;
  setCompressionPercentage: (value: number) => void;
  compressionLevel: string;
  estimatedSize: number | null;
  originalSize: number;
  setTargetSize: (size: number | null) => void;
}

const CompressionSettings: React.FC<CompressionSettingsProps> = ({ 
  compressionPercentage, 
  setCompressionPercentage, 
  compressionLevel,
  estimatedSize,
  originalSize,
  setTargetSize
}) => {
  const isMobile = useIsMobile();

  // Helper to handle preset size selection with exact target size
  const handlePresetSelection = (targetSizeKB: number) => {
    const targetSizeBytes = targetSizeKB * 1024;
    setTargetSize(targetSizeBytes);
    
    // Calculate precise compression percentage needed to reach target size
    if (originalSize > 0) {
      const neededPercentage = getCompressionForExactTargetSize(originalSize, targetSizeKB);
      setCompressionPercentage(neededPercentage);
    }
  };

  // Calculate current estimated output size
  const currentEstimatedSize = estimatedSize || 
    (originalSize > 0 ? calculateEstimatedSize(originalSize, compressionPercentage) : null);

  return (
    <div className="flex flex-col space-y-4">
      {/* Compression Percentage Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="compression-percentage" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" /> Compression Level
          </Label>
          <span className="text-sm font-medium">{compressionPercentage}%</span>
        </div>
        <Slider 
          id="compression-percentage"
          value={[compressionPercentage]} 
          min={5} 
          max={98} // Increased from 95 to 98 for more powerful compression
          step={1} 
          className="w-full"
          onValueChange={(value) => {
            setCompressionPercentage(value[0]);
            setTargetSize(null); // Reset target size when manually adjusting
          }}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Minimum Compression</span>
          <span>Maximum Compression</span>
        </div>
      </div>

      {/* Preset Target Size Buttons */}
      <div className="space-y-2">
        <Label className="text-sm">Preset Target Sizes</Label>
        <div className={`flex ${isMobile ? 'flex-wrap gap-1' : 'gap-2'}`}>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={() => handlePresetSelection(100)}
            className="text-xs"
          >
            100 KB
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={() => handlePresetSelection(254)}
            className="text-xs"
          >
            254 KB
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={() => handlePresetSelection(500)}
            className="text-xs"
          >
            500 KB
          </Button>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"} 
            onClick={() => handlePresetSelection(1024)}
            className="text-xs"
          >
            1 MB
          </Button>
        </div>
      </div>
      
      {/* Selected Compression Level Display */}
      <div className="p-3 bg-gray-50 rounded-md">
        <p className="text-sm font-medium">
          {compressionLevel === "maximum" && "Maximum compression: Highest possible size reduction, may affect quality"}
          {compressionLevel === "extreme" && "Extreme compression: Very high compression with minimal quality loss"}
          {compressionLevel === "high" && "High compression: Significant size reduction with acceptable quality"}
          {compressionLevel === "medium" && "Medium compression: Balanced quality and file size reduction"}
          {compressionLevel === "low" && "Low compression: Preserves high quality with minimal compression"}
        </p>
      </div>
      
      {/* Estimated Size Information */}
      {currentEstimatedSize !== null && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm flex items-center justify-between">
            <span className="font-medium">Original Size:</span>
            <span>{formatFileSize(originalSize)}</span>
          </p>
          <p className="text-sm flex items-center justify-between mt-1">
            <span className="font-medium">Estimated Size:</span>
            <span className="text-blue-700">{formatFileSize(currentEstimatedSize)}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Note: Actual compressed size may vary based on PDF content
          </p>
        </div>
      )}
    </div>
  );
};

export default CompressionSettings;
