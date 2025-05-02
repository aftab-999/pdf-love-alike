
import React, { useState, useEffect } from 'react';
import { FileDown } from 'lucide-react';
import DropArea from '@/components/DropArea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CompressFileDisplay from '@/components/CompressPDFComponents/CompressFileDisplay';
import CompressionSettings from '@/components/CompressPDFComponents/CompressionSettings';
import { calculateEstimatedSize } from '@/lib/fileUtils';

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [compressionPercentage, setCompressionPercentage] = useState(50);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [targetSize, setTargetSize] = useState<number | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
    setCompressedFile(null);
    
    // Calculate total size of files
    const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
    setOriginalSize(totalSize);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      const newTotalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
      setOriginalSize(newTotalSize);
      setIsComplete(false);
      setCompressedFile(null);
      return newFiles;
    });
  };

  // Calculate estimated file size based on compression percentage
  useEffect(() => {
    if (files.length > 0) {
      // Use the improved calculation function from fileUtils
      const estimated = calculateEstimatedSize(originalSize, compressionPercentage);
      setEstimatedSize(estimated);
    } else {
      setEstimatedSize(null);
    }
  }, [files, compressionPercentage, targetSize, originalSize]);

  // Update compression level based on slider percentage
  useEffect(() => {
    if (compressionPercentage > 90) {
      setCompressionLevel("maximum");
    } else if (compressionPercentage > 80) {
      setCompressionLevel("extreme");
    } else if (compressionPercentage > 60) {
      setCompressionLevel("high");
    } else if (compressionPercentage > 30) {
      setCompressionLevel("medium");
    } else {
      setCompressionLevel("low");
    }
  }, [compressionPercentage]);

  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one PDF file to compress.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setIsComplete(false);
    setCompressedFile(null);

    // Simulate compression process with progress updates
    const totalSteps = 10;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(step * 10);
    }

    // Simulate compression completion
    // In a real implementation with Supabase, this would actually process the file
    // For now, we'll create a mock compressed file for download demonstration
    const mockCompressedFile = new Blob([files[0]], { type: "application/pdf" });
    setCompressedFile(mockCompressedFile);

    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "PDF compressed successfully!",
        description: "Your PDF has been compressed and is being downloaded.",
      });
      
      // Automatically trigger download after compression is complete
      handleDownload();
    }, 300);
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    
    // Create a download link and trigger it
    const downloadURL = URL.createObjectURL(compressedFile);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadURL;
    downloadLink.download = files[0].name.replace('.pdf', '') + '-compressed.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast({
      title: "Download started",
      description: "Your compressed PDF is being downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-3 sm:px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center mb-4 sm:mb-8">
          <div className="bg-purple-500 p-3 sm:p-4 rounded-full">
            <FileDown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mt-3 sm:mt-4 text-center">Compress PDF</h1>
          <p className="text-gray-600 text-center mt-2 text-sm sm:text-base">
            Reduce the size of your PDF files while maintaining quality
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <DropArea onFilesAdded={handleFilesAdded} />
          
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-xs sm:text-sm text-blue-800">
              Your uploaded files are automatically deleted within 10 minutes from our database. 
              We respect your privacy and ensure no data leaks occur.
            </AlertDescription>
          </Alert>
        </div>

        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <CompressFileDisplay files={files} onRemove={handleRemoveFile} />

            <div className="mb-6">
              <CompressionSettings 
                compressionPercentage={compressionPercentage}
                setCompressionPercentage={setCompressionPercentage}
                compressionLevel={compressionLevel}
                estimatedSize={estimatedSize}
                originalSize={originalSize}
                setTargetSize={setTargetSize}
              />
            </div>

            {isProcessing ? (
              <div className="space-y-4">
                <p className="text-center">Processing...</p>
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-gray-500">{progress}% complete</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Button 
                  onClick={handleCompress} 
                  disabled={isProcessing || files.length === 0} 
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {isComplete ? "Compress Again" : "Compress PDF"}
                </Button>
                
                {isComplete && compressedFile && (
                  <Button 
                    onClick={handleDownload} 
                    variant="outline" 
                    className="border-purple-500 text-purple-500 hover:bg-purple-50"
                  >
                    Download Compressed PDF
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* How-to section */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 sm:p-6 mt-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-purple-700">How to compress a PDF file</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 sm:space-y-3 ml-0 sm:ml-2 text-sm sm:text-base">
            <li className="pl-1 sm:pl-2">Upload your PDF file by clicking the upload area or dragging and dropping</li>
            <li className="pl-1 sm:pl-2">Choose your desired compression level using the slider or presets</li>
            <li className="pl-1 sm:pl-2">Click "Compress PDF" and wait for the process to complete</li>
            <li className="pl-1 sm:pl-2">Your compressed file will be automatically downloaded when ready</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CompressPDF;
