
import React, { useState } from 'react';
import { Merge, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DropArea from '@/components/DropArea';
import FileList from '@/components/FileList';
import { useToast } from '@/components/ui/use-toast';

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMergeFiles = () => {
    if (files.length < 2) {
      toast({
        title: "Not enough files",
        description: "You need at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // In a real implementation, this would call a PDF library to merge the files
    // For now, we'll simulate processing and show a success message
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "PDF files merged successfully!",
        description: "In a real application, you would be able to download the merged file now.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <div className="bg-blue-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Merge className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Merge PDF</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Combine multiple PDF files into one document. Arrange them in any order you want.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <DropArea 
            acceptedTypes={['.pdf', 'application/pdf']} 
            maxFiles={20}
            onFilesAdded={handleFilesAdded} 
          />
        </div>

        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <FileList files={files} onRemove={handleRemoveFile} />
            
            <div className="mt-6 text-center">
              <Button 
                onClick={handleMergeFiles} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 h-auto"
                disabled={files.length < 2 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <Merge className="mr-2" size={20} />
                    Merge PDF Files
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2 text-blue-700">How to merge PDF files</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Upload PDF files by dragging and dropping or clicking the upload area</li>
            <li>Rearrange files in the desired order (drag and drop)</li>
            <li>Click the "Merge PDF Files" button</li>
            <li>Download your combined PDF document</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MergePDF;
