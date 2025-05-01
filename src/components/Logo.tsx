
import React from 'react';
import { FileText } from 'lucide-react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo = ({ size = 28, className = '' }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FileText size={size} className="text-pdf-red" />
      <span className="font-bold text-xl">
        i<span className="text-pdf-red">love</span>pdf
      </span>
    </div>
  );
};

export default Logo;
