
import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import DropArea from '@/components/DropArea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const CompressPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [isComplete, setIsComplete] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles);
    setIsComplete(false);
  };

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
                    <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
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
              <div className="flex flex-col space-y-2">
                <Label htmlFor="compression-level">Compression Level</Label>
                <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                  <SelectTrigger id="compression-level" className="w-full">
                    <SelectValue placeholder="Select compression level" />
                  </SelectTrigger>
                  <SelectContent>
                    {compressionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {compressionLevel === "low" && "Preserves high quality with minimal compression."}
                  {compressionLevel === "medium" && "Balanced quality and file size reduction."}
                  {compressionLevel === "high" && "Maximum compression with acceptable quality."}
                </p>
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
