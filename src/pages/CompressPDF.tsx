
import React, { useState, useEffect } from 'react';
import { Compass, Percent } from 'lucide-react';
import DropArea from '@/components/DropArea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [compressionPercentage, setCompressionPercentage] = useState(50);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
  };

  // Calculate estimated file size based on compression percentage
  useEffect(() => {
    if (files.length > 0) {
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      // Calculate estimated size: lower compression percentage means smaller file size
      const reduction = (100 - compressionPercentage) / 100;
      const estimated = totalSize * (1 - reduction * 0.9); // Maximum 90% reduction at 0% slider
      setEstimatedSize(estimated);
    } else {
      setEstimatedSize(null);
    }
  }, [files, compressionPercentage]);

  // Update compression level based on slider percentage
  useEffect(() => {
    if (compressionPercentage < 30) {
      setCompressionLevel("high");
    } else if (compressionPercentage > 70) {
      setCompressionLevel("low");
    } else {
      setCompressionLevel("medium");
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

    // Simulate compression process with progress updates
    const totalSteps = 10;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(step * 10);
    }

    // Simulate completion
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "PDF compressed successfully!",
        description: "Your PDF has been compressed and is ready for download.",
      });
    }, 300);
  };

  const handleDownload = () => {
    // In a real implementation, this would download the compressed file
    // For now, we'll just show a toast notification
    toast({
      title: "Download started",
      description: "Your compressed PDF is being downloaded.",
    });
  };

  const compressionOptions = [
    { value: "low", label: "Low compression (higher quality)" },
    { value: "medium", label: "Medium compression (balanced)" },
    { value: "high", label: "High compression (smaller size)" },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-purple-500 p-4 rounded-full">
            <Compass className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mt-4">Compress PDF</h1>
          <p className="text-gray-600 text-center mt-2">
            Reduce the size of your PDF files while maintaining quality
          </p>
        </div>

        {files.length === 0 ? (
          <DropArea onFilesAdded={handleFilesAdded} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Selected Files</h3>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <span>{file.name} ({formatFileSize(file.size)})</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
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
                    <span>Maximum Compression</span>
                    <span>Minimum Compression</span>
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
                      <span>{formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}</span>
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
            </div>

            {isProcessing ? (
              <div className="space-y-4">
                <p className="text-center">Processing...</p>
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-gray-500">{progress}% complete</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <Button onClick={handleCompress} disabled={isProcessing || files.length === 0} className="bg-purple-500 hover:bg-purple-600">
                  {isComplete ? "Compress Again" : "Compress PDF"}
                </Button>
                
                {isComplete && (
                  <Button onClick={handleDownload} variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-50">
                    Download Compressed PDF
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompressPDF;
