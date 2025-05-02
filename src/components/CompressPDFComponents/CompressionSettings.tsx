
import React from 'react';
import { Percent } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { formatFileSize } from '@/lib/fileUtils';

interface CompressionSettingsProps {
  compressionPercentage: number;
  setCompressionPercentage: (value: number) => void;
  compressionLevel: string;
  estimatedSize: number | null;
  originalSize: number;
}

const CompressionSettings: React.FC<CompressionSettingsProps> = ({ 
  compressionPercentage, 
  setCompressionPercentage, 
  compressionLevel,
  estimatedSize,
  originalSize
}) => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Compression Percentage Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="compression-percentage" className="flex items-center gap-2">
            <Percent className="h-4 w-4" /> Compression Level
          </Label>
          <span className="text-sm font-medium">{compressionPercentage}%</span>
        </div>
        <Slider 
          id="compression-percentage"
          value={[compressionPercentage]} 
          min={0} 
          max={100} 
          step={1} 
          className="w-full"
          onValueChange={(value) => setCompressionPercentage(value[0])}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Minimum Compression</span>
          <span>Maximum Compression</span>
        </div>
      </div>

      {/* Selected Compression Level Display */}
      <div className="p-3 bg-gray-50 rounded-md">
        <p className="text-sm font-medium">
          {compressionLevel === "low" && "Low compression: Preserves high quality with minimal compression"}
          {compressionLevel === "medium" && "Medium compression: Balanced quality and file size reduction"}
          {compressionLevel === "high" && "High compression: Maximum compression with acceptable quality"}
        </p>
      </div>
      
      {/* Estimated Size Information */}
      {estimatedSize !== null && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm flex items-center justify-between">
            <span className="font-medium">Original Size:</span>
            <span>{formatFileSize(originalSize)}</span>
          </p>
          <p className="text-sm flex items-center justify-between mt-1">
            <span className="font-medium">Estimated Size:</span>
            <span className="text-blue-700">{formatFileSize(estimatedSize)}</span>
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
