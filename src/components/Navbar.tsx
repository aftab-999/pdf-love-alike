
import React from 'react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="border-b border-gray-200 py-4 px-6 bg-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        
        <div className="hidden md:flex space-x-6 text-gray-600">
          <Link to="/compress-pdf" className="hover:text-purple-500 transition-colors">
            Compress PDF
          </Link>
          <Link to="/tools" className="hover:text-purple-500 transition-colors">
            All Tools
          </Link>
          <Link to="#" className="hover:text-purple-500 transition-colors">
            How To
          </Link>
          <Link to="#" className="hover:text-purple-500 transition-colors">
            Help
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden md:block">
            Sign In
          </Button>
          <Button className="bg-purple-500 hover:bg-purple-600 text-white">
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
