
import React from 'react';
import { 
  FileImage, Images, Merge, FileMinus, Compress, 
  Lock, File, Edit, Download, FileText, Scissors 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ToolCard from '@/components/ToolCard';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  
  const tools = [
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
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-pdf-red to-red-700 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Every PDF tool you need in one place
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in opacity-90">
            Convert, compress, edit and manipulate your PDF files with ease. No installations. 100% free.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-pdf-red hover:bg-gray-100 font-bold text-lg px-8 py-6 h-auto"
            onClick={() => navigate('/tools')}
          >
            View All Tools
          </Button>
        </div>
      </div>
      
      {/* Tools section */}
      <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Popular PDF Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
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
      
      {/* Features section */}
      <div className="bg-white py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our PDF Tools?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Lock className="text-pdf-blue" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Processing</h3>
              <p className="text-gray-600">Your files are securely processed and automatically deleted after 2 hours.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Download className="text-green-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free & Easy</h3>
              <p className="text-gray-600">No registration or installation needed. Process files in just a few clicks.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-50 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FileText className="text-purple-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">High Quality</h3>
              <p className="text-gray-600">Our tools process your PDFs while maintaining the best possible quality.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your PDFs?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get started with our easy-to-use PDF tools and make your document management effortless.
        </p>
        <Button 
          size="lg" 
          className="bg-pdf-red hover:bg-red-700 text-white font-bold text-lg px-8 py-6 h-auto"
          onClick={() => navigate('/tools')}
        >
          Try for Free Now
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
