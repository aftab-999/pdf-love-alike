
import React from 'react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/fileUtils';

interface CompressFileDisplayProps {
  files: File[];
  onRemove: (index: number) => void;
}

const CompressFileDisplay: React.FC<CompressFileDisplayProps> = ({ files, onRemove }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Selected Files</h3>
      <ul className="space-y-2">
        {files.map((file, index) => (
          <li key={index} className="flex items-center justify-between p-3 border rounded-md">
            <span>{file.name} ({formatFileSize(file.size)})</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompressFileDisplay;
