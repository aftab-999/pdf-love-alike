
import React from 'react';
import { 
  FileImage, Images, Merge, FileMinus, Compress, 
  Lock, File, Edit, FileText, Scissors, Crop, RotateCw
} from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import { useNavigate } from 'react-router-dom';

const ToolsPage = () => {
  const navigate = useNavigate();
  
  const allTools = [
    {
      title: 'PDF to Image',
      description: 'Convert PDF pages to JPG or PNG images',
      icon: FileImage,
      color: 'bg-pdf-red',
      path: '/pdf-to-image'
    },
    {
      title: 'Image to PDF',
      description: 'Convert JPG or PNG images to PDF',
      icon: Images,
      color: 'bg-green-500',
      path: '/image-to-pdf'
    },
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one file',
      icon: Merge,
      color: 'bg-blue-500',
      path: '/merge-pdf'
    },
    {
      title: 'Split PDF',
      description: 'Extract pages from your PDF',
      icon: FileMinus,
      color: 'bg-yellow-500',
      path: '/split-pdf'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce the size of your PDF',
      icon: Compress,
      color: 'bg-purple-500',
      path: '/compress-pdf'
    },
    {
      title: 'Protect PDF',
      description: 'Add password to your PDF',
      icon: Lock,
      color: 'bg-orange-500',
      path: '/protect-pdf'
    },
    {
      title: 'PDF Converter',
      description: 'Convert to and from PDF',
      icon: File,
      color: 'bg-pink-500',
      path: '/convert-pdf'
    },
    {
      title: 'Edit PDF',
      description: 'Add text and shapes to your PDF',
      icon: Edit,
      color: 'bg-indigo-500',
      path: '/edit-pdf'
    },
    {
      title: 'OCR PDF',
      description: 'Make text in your PDF selectable',
      icon: FileText,
      color: 'bg-teal-500',
      path: '/ocr-pdf'
    },
    {
      title: 'PDF to Word',
      description: 'Convert PDF to Word documents',
      icon: File,
      color: 'bg-blue-700',
      path: '/pdf-to-word'
    },
    {
      title: 'PDF to PowerPoint',
      description: 'Convert PDF to PowerPoint slides',
      icon: File,
      color: 'bg-red-600',
      path: '/pdf-to-powerpoint'
    },
    {
      title: 'PDF to Excel',
      description: 'Extract tables from PDF to Excel',
      icon: File,
      color: 'bg-green-700',
      path: '/pdf-to-excel'
    },
    {
      title: 'Rotate PDF',
      description: 'Rotate PDF pages permanently',
      icon: RotateCw,
      color: 'bg-amber-500',
      path: '/rotate-pdf'
    },
    {
      title: 'Crop PDF',
      description: 'Adjust the margin of your PDF',
      icon: Crop,
      color: 'bg-cyan-600',
      path: '/crop-pdf'
    },
    {
      title: 'PDF Organizer',
      description: 'Rearrange pages in your PDF',
      icon: Scissors,
      color: 'bg-violet-600',
      path: '/organize-pdf'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-2">All PDF Tools</h1>
        <p className="text-gray-600 mb-8">Choose the PDF tool you need from our complete collection</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allTools.map((tool, index) => (
            <ToolCard
              key={index}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              color={tool.color}
              onClick={() => navigate(tool.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
