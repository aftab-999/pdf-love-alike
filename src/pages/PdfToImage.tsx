
import React, { useState } from 'react';
import { FileImage, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DropArea from '@/components/DropArea';
import FileList from '@/components/FileList';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

const PdfToImage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageFormat, setImageFormat] = useState('jpg');
  const [dpi, setDpi] = useState('300');
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    // For PDF to Image, we only need one file
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleConvertFile = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    // Simulate processing with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast({
            title: "PDF converted successfully!",
            description: "In a real application, image files would be available for download.",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <div className="bg-pdf-red p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FileImage className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">PDF to Image</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Convert each page of your PDF file into JPG or PNG image files.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <DropArea 
            acceptedTypes={['.pdf', 'application/pdf']} 
            maxFiles={1}
            onFilesAdded={handleFilesAdded} 
          />
        </div>

        {file && (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <FileList files={[file]} onRemove={handleRemoveFile} />
              
              <div className="mt-6">
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Format
                    </label>
                    <Select defaultValue={imageFormat} onValueChange={setImageFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpg">JPG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Quality (DPI)
                    </label>
                    <Select defaultValue={dpi} onValueChange={setDpi}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select DPI" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 DPI</SelectItem>
                        <SelectItem value="200">200 DPI</SelectItem>
                        <SelectItem value="300">300 DPI (Recommended)</SelectItem>
                        <SelectItem value="600">600 DPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isProcessing && (
                  <div className="mb-6">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-600 mt-2">Processing: {progress}%</p>
                  </div>
                )}
                
                <div className="text-center">
                  <Button 
                    onClick={handleConvertFile} 
                    className="bg-pdf-red hover:bg-red-700 text-white px-8 py-2 h-auto"
                    disabled={isProcessing || !file}
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin mr-2">◌</span>
                        Converting...
                      </>
                    ) : (
                      <>
                        <FileImage className="mr-2" size={20} />
                        Convert to {imageFormat.toUpperCase()}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2 text-red-700">How to convert PDF to images</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Upload your PDF file using drag and drop or the upload button</li>
                <li>Select your preferred image format (JPG or PNG)</li>
                <li>Choose the image quality (DPI)</li>
                <li>Click "Convert" and wait for the process to complete</li>
                <li>Download your converted images</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PdfToImage;
