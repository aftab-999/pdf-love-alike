
import React, { useState, useCallback } from 'react';
import { Upload, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface DropAreaProps {
  acceptedTypes?: string[];
  maxFiles?: number;
  onFilesAdded: (files: File[]) => void;
}

const DropArea: React.FC<DropAreaProps> = ({ 
  acceptedTypes = ['.pdf', 'application/pdf'], 
  maxFiles = 10,
  onFilesAdded 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFiles = (files: File[]) => {
    // Check file types
    const validFiles = Array.from(files).filter(file => {
      const fileType = file.type;
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return acceptedTypes.includes(fileType) || acceptedTypes.includes(fileExtension);
    });

    if (validFiles.length < files.length) {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are accepted.",
        variant: "destructive",
      });
    }

    // Check number of files
    if (validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed.`,
        variant: "destructive",
      });
      return validFiles.slice(0, maxFiles);
    }

    return validFiles;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      const validFiles = validateFiles(Array.from(files));
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    }
  }, [maxFiles, acceptedTypes, onFilesAdded, toast]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const validFiles = validateFiles(Array.from(files));
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    }
  }, [maxFiles, acceptedTypes, onFilesAdded, toast]);

  return (
    <div
      className={`drop-area ${isDragging ? 'border-pdf-blue bg-blue-50' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload size={48} className="text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Drop your PDF files here</h3>
      <p className="text-gray-500 mb-4 text-center">or</p>
      
      <Button className="bg-pdf-blue hover:bg-blue-600" asChild>
        <label>
          <input
            type="file"
            accept={acceptedTypes.join(',')}
            multiple={maxFiles > 1}
            className="hidden"
            onChange={handleFileInputChange}
          />
          Select Files
        </label>
      </Button>
    </div>
  );
};

export default DropArea;
