
import React from 'react';
import { Compress } from 'lucide-react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo = ({ size = 28, className = '' }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Compress size={size} className="text-purple-500" />
      <span className="font-bold text-xl">
        Compress<span className="text-purple-500">ify.ai</span>
      </span>
    </div>
  );
};

export default Logo;
