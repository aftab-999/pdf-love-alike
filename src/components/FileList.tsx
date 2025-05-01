
import React from 'react';
import { FileText, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove }) => {
  if (!files.length) return null;
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Selected Files</h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="bg-pdf-red p-2 rounded-lg">
                <FileText className="text-white" size={20} />
              </div>
              <div>
                <p className="font-medium truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-gray-500 hover:text-pdf-red hover:bg-red-50" 
              onClick={() => onRemove(index)}
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
