import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  description?: string; 
  gradientFrom: string;
  gradientTo: string; 
  colorClass: string;
}

const StatCard = ({ icon, value, label, colorClass }: StatCardProps): React.ReactNode => {
  return (
    <div className="bg-amber-50 backdrop-blur-sm p-4 rounded-xl shadow-lg flex items-center space-x-4 border border-white/5 transition-all hover:border-white/20 hover:scale-105">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-black">{value}</p>
        <p className="text-sm text-black">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;