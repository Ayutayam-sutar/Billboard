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
   <div className="bg-amber-50 backdrop-blur-sm p-4 sm:p-5 rounded-xl shadow-lg flex items-center space-x-4 sm:space-x-5 border border-amber-100 transition-all hover:border-amber-200 hover:scale-[1.02] duration-300">
  <div className={`p-3 sm:p-4 rounded-lg ${colorClass} flex-shrink-0`}>
    {icon}
  </div>
  <div className="min-w-0">
    <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{value}</p>
    <p className="text-sm sm:text-base text-gray-700 font-medium mt-1">{label}</p>
  </div>
</div>
  );
};

export default StatCard;