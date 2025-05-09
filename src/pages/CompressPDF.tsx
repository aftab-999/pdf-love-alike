
import React, { useState, useEffect } from 'react';
import { FileDown } from 'lucide-react';
import DropArea from '@/components/DropArea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CompressFileDisplay from '@/components/CompressPDFComponents/CompressFileDisplay';
import CompressionSettings from '@/components/CompressPDFComponents/CompressionSettings';
import { 
  calculateEstimatedSize, 
  compressPDF,
  compressPDFToTargetSize,
  formatFileSize,
  calculateCompressionPercentage,
  downloadPDF
} from '@/lib/fileUtils';

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [compressionPercentage, setCompressionPercentage] = useState(60);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [targetSize, setTargetSize] = useState<number | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [actualCompressedSize, setActualCompressedSize] = useState<number | null>(null);
  const [compressionSuccessful, setCompressionSuccessful] = useState(false);
  const [fileName, setFileName] = useState<string>('compressed.pdf');

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
    setCompressedFile(null);
    setActualCompressedSize(null);
    setCompressionSuccessful(false);
    
    if (newFiles.length > 0) {
      const firstFileName = newFiles[0].name;
      setFileName(firstFileName.replace(/\.pdf$/i, '') + '-compressed.pdf');
    }
    
    // Calculate total size of files
    const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
    setOriginalSize(totalSize);
    
    console.log(`File added: ${newFiles[0]?.name}, size: ${formatFileSize(totalSize)}`);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      const newTotalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
      setOriginalSize(newTotalSize);
      setIsComplete(false);
      setCompressedFile(null);
      setActualCompressedSize(null);
      setCompressionSuccessful(false);
      return newFiles;
    });
  };

  // Calculate estimated file size based on compression percentage
  useEffect(() => {
    if (files.length > 0) {
      // Use the improved calculation function from fileUtils
      const estimated = calculateEstimatedSize(originalSize, compressionPercentage);
      setEstimatedSize(estimated);
      console.log(`Estimated size with ${compressionPercentage}% compression: ${formatFileSize(estimated)}`);
    } else {
      setEstimatedSize(null);
    }
  }, [files, compressionPercentage, originalSize]);

  // Update compression level based on slider percentage
  useEffect(() => {
    let newLevel = "medium";
    if (compressionPercentage > 90) {
      newLevel = "maximum";
    } else if (compressionPercentage > 80) {
      newLevel = "extreme";
    } else if (compressionPercentage > 60) {
      newLevel = "high";
    } else if (compressionPercentage > 30) {
      newLevel = "medium";
    } else {
      newLevel = "low";
    }
    setCompressionLevel(newLevel);
    console.log(`Compression level updated to: ${newLevel}`);
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
    setActualCompressedSize(null);
    setCompressionSuccessful(false);

    try {
      // Get the file to compress
      const fileToCompress = files[0];
      console.log(`Starting compression: Original size: ${formatFileSize(fileToCompress.size)}`);
      console.log(`Compression method: ${targetSize !== null ? 'Target size' : 'Compression level'}`);
      
      let compressedBlob: Blob;
      
      // Update progress function to keep UI in sync
      const updateProgress = (value: number) => {
        setProgress(value);
        console.log(`Compression progress: ${value}%`);
      };
      
      // Check if we're targeting a specific size or using general compression level
      if (targetSize !== null) {
        // Compress to target size in KB
        const targetKB = Math.round(targetSize / 1024);
        console.log(`Compressing to target size: ${targetKB}KB`);
        compressedBlob = await compressPDFToTargetSize(fileToCompress, targetKB, updateProgress);
      } else {
        // Compress using the selected compression level
        console.log(`Compressing with level: ${compressionLevel}`);
        compressedBlob = await compressPDF(fileToCompress, compressionLevel, updateProgress);
      }
      
      // Set the compressed file for download
      setCompressedFile(compressedBlob);
      setActualCompressedSize(compressedBlob.size);
      
      // Log compression rate achieved
      const compressionRate = calculateCompressionPercentage(fileToCompress.size, compressedBlob.size);
      console.log(`Compression complete: 
      - Original: ${formatFileSize(fileToCompress.size)} 
      - Compressed: ${formatFileSize(compressedBlob.size)} 
      - Reduction: ${compressionRate}%
      - Estimated: ${estimatedSize ? formatFileSize(estimatedSize) : 'Not calculated'}
      - Difference from estimate: ${estimatedSize ? formatFileSize(Math.abs(estimatedSize - compressedBlob.size)) : 'N/A'}
      `);
      
      // Determine if compression was successful (at least 5% reduction)
      const isSuccessful = compressionRate >= 5;
      setCompressionSuccessful(isSuccessful);
      
      setProgress(100);
      setIsComplete(true);
      
      if (isSuccessful) {
        toast({
          title: "PDF compressed successfully!",
          description: `Original: ${formatFileSize(fileToCompress.size)} → Compressed: ${formatFileSize(compressedBlob.size)} (${compressionRate}% smaller)`,
        });
      } else {
        toast({
          title: "Limited compression achieved",
          description: "The PDF could not be compressed significantly. Try a different PDF or higher compression level.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Compression error:", error);
      toast({
        title: "Compression failed",
        description: error instanceof Error ? error.message : "There was an error compressing your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile || files.length === 0) return;
    
    try {
      // Use the downloadPDF utility function
      downloadPDF(compressedFile, fileName);
      
      toast({
        title: "Download started",
        description: "Your compressed PDF is being downloaded.",
      });
      
      console.log(`Downloaded compressed PDF: ${fileName}`);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your PDF. Please try again.",
        variant: "destructive",
      });
    }
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
              Your uploaded files are automatically deleted after processing. 
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
                <p className="text-center">Processing your PDF...</p>
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
                  <div className="space-y-4">
                    <Button 
                      onClick={handleDownload} 
                      variant="outline" 
                      className="w-full border-purple-500 text-purple-500 hover:bg-purple-50"
                    >
                      Download Compressed PDF ({formatFileSize(actualCompressedSize || 0)})
                    </Button>
                    
                    {actualCompressedSize && (
                      <div className={`p-3 ${compressionSuccessful ? 'bg-green-50 border-green-100' : 'bg-yellow-50 border-yellow-100'} border rounded-md`}>
                        <p className="text-sm flex items-center justify-between">
                          <span className="font-medium">Original size:</span>
                          <span>{formatFileSize(originalSize)}</span>
                        </p>
                        <p className="text-sm flex items-center justify-between mt-1">
                          <span className="font-medium">Compressed size:</span>
                          <span className={compressionSuccessful ? 'text-green-700' : 'text-yellow-700'}>
                            {formatFileSize(actualCompressedSize)}
                          </span>
                        </p>
                        <p className="text-sm flex items-center justify-between mt-1">
                          <span className="font-medium">Reduction:</span>
                          <span className={compressionSuccessful ? 'text-green-700' : 'text-yellow-700'}>
                            {calculateCompressionPercentage(originalSize, actualCompressedSize)}%
                          </span>
                        </p>
                        {!compressionSuccessful && (
                          <p className="text-xs text-yellow-700 mt-2">
                            Limited compression achieved. This PDF may already be optimized or contain content that's difficult to compress.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
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
            <li className="pl-1 sm:pl-2">Your compressed file will be available for download when ready</li>
          </ol>
          
          <div className="mt-4 p-3 bg-white rounded-md border border-purple-100">
            <h4 className="font-semibold text-purple-700 mb-1">Important Note:</h4>
            <p className="text-sm text-gray-700">
              You must replace "YOUR_PDF_CO_API_KEY" in the code with your actual PDF.co API key to make the compression work.
              Get your API key from <a href="https://pdf.co" className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">PDF.co</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompressPDF;
