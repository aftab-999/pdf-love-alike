
import React, { useState } from 'react';
import { FileMinus, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DropArea from '@/components/DropArea';
import FileList from '@/components/FileList';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

const SplitPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitMode, setSplitMode] = useState<'pages' | 'range'>('pages');
  const [pagesInput, setPagesInput] = useState('');
  const [rangeInput, setRangeInput] = useState('');
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    // For split, we only need one file
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSplitFile = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file to split.",
        variant: "destructive",
      });
      return;
    }

    // Validate input based on split mode
    if (splitMode === 'pages' && !pagesInput.trim()) {
      toast({
        title: "Page numbers required",
        description: "Please enter the page numbers to extract.",
        variant: "destructive",
      });
      return;
    }

    if (splitMode === 'range' && !rangeInput.trim()) {
      toast({
        title: "Page ranges required",
        description: "Please enter the page ranges to extract.",
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
            title: "PDF split successfully!",
            description: "In a real application, split PDF parts would be available for download.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <div className="bg-yellow-500 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FileMinus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Split PDF</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Extract specific pages or page ranges from your PDF file to create new PDF documents.
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
                <div className="mb-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      className={`${splitMode === 'pages' ? 'bg-yellow-500' : 'bg-gray-200 text-gray-700'} hover:bg-yellow-600`}
                      onClick={() => setSplitMode('pages')}
                    >
                      Extract Pages
                    </Button>
                    <Button 
                      className={`${splitMode === 'range' ? 'bg-yellow-500' : 'bg-gray-200 text-gray-700'} hover:bg-yellow-600`}
                      onClick={() => setSplitMode('range')}
                    >
                      Split by Range
                    </Button>
                  </div>
                </div>
                
                <div className="mb-6">
                  {splitMode === 'pages' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter page numbers to extract (e.g., 1,3,5-7)
                      </label>
                      <Input 
                        value={pagesInput}
                        onChange={(e) => setPagesInput(e.target.value)}
                        placeholder="1,3,5-7"
                        className="mb-2"
                      />
                      <p className="text-xs text-gray-500">
                        Enter individual pages or ranges separated by commas
                      </p>
                    </div>
                  )}
                  
                  {splitMode === 'range' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter page range (e.g., 1-5,6-10)
                      </label>
                      <Input 
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder="1-5,6-10"
                        className="mb-2"
                      />
                      <p className="text-xs text-gray-500">
                        Enter ranges to create separate PDFs (e.g., 1-5 will create a PDF with pages 1-5)
                      </p>
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="mb-6">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-600 mt-2">Processing: {progress}%</p>
                  </div>
                )}
                
                <div className="text-center">
                  <Button 
                    onClick={handleSplitFile} 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2 h-auto"
                    disabled={isProcessing || !file}
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin mr-2">◌</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileMinus className="mr-2" size={20} />
                        Split PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2 text-yellow-700">How to split PDF files</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Upload your PDF file by dragging and dropping or clicking the upload area</li>
                <li>Choose whether to extract specific pages or split by page ranges</li>
                <li>Enter the page numbers or ranges you want to extract</li>
                <li>Click the "Split PDF" button</li>
                <li>Download your split PDF files</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SplitPDF;
