
import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Logo className="mb-4" />
            <p className="text-gray-600 text-sm">
              Free web app to convert, compress, and manipulate PDF files.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Convert</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              {/* Only include links to pages that actually exist */}
              <li><Link to="/pdf-to-image" className="hover:text-pdf-red">PDF to Image</Link></li>
              <li><span className="cursor-not-allowed opacity-60">Image to PDF</span></li>
              <li><span className="cursor-not-allowed opacity-60">PDF to Word</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Edit PDF</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><Link to="/merge-pdf" className="hover:text-pdf-red">Merge PDF</Link></li>
              <li><Link to="/split-pdf" className="hover:text-pdf-red">Split PDF</Link></li>
              <li><Link to="/compress-pdf" className="hover:text-pdf-red">Compress PDF</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              {/* Replace non-existent routes with disabled spans */}
              <li><span className="cursor-not-allowed opacity-60">About Us</span></li>
              <li><span className="cursor-not-allowed opacity-60">Privacy Policy</span></li>
              <li><span className="cursor-not-allowed opacity-60">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-300 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} ilovepdf. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
