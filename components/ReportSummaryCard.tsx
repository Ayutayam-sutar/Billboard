
import React from 'react';
import { Report } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, MapPinIcon } from './Icons';

interface ReportSummaryCardProps {
  report: Report;
  onClick: () => void;
}

const ReportSummaryCard = ({ report, onClick }: ReportSummaryCardProps): React.ReactNode => {
  const isCompliant = report.is_compliant;
  const statusColor = isCompliant ? 'text-green-400' : 'text-red-400';
  const statusBg = isCompliant ? 'bg-green-500/10' : 'bg-red-500/10';
  const statusRing = isCompliant ? 'ring-green-500/30' : 'ring-red-500/30';

  return (
    <div 
        onClick={onClick}
        className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col sm:flex-row items-stretch cursor-pointer transition-all duration-200 hover:shadow-xl hover:ring-2 hover:ring-teal-500/50`}
    >
      <div className="sm:w-1/3 flex-shrink-0">
        <img src={report.imageUrl} alt="Billboard" className="w-full h-40 sm:h-full object-cover" />
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBg} ${statusColor} ring-1 ring-inset ${statusRing}`}>
            {isCompliant ? <CheckCircleIcon className="h-4 w-4 mr-1.5" /> : <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />}
            {isCompliant ? 'Compliant' : 'Violations'}
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Analyzed on {new Date(report.timestamp).toLocaleDateString()}
          </p>
          <p className="mt-2 text-sm text-gray-300 line-clamp-2">
            {report.summary}
          </p>
        </div>
      
      </div>
    </div>
  );
};

export default ReportSummaryCard;
