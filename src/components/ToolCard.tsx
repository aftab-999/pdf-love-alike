
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon: Icon, color, onClick }) => {
  return (
    <div className="tool-card" onClick={onClick}>
      <div className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 ${color}`}>
        <Icon className="text-white" size={28} />
      </div>
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default ToolCard;
