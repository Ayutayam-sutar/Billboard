import React from 'react';
import { AlertTriangleIcon } from './Icons';

interface AlertNotificationProps {
  title: string;
  message: string;
  timestamp: string; 
   type: 'error' | 'warning' | 'success' | 'info' | 'neutral'; // Add this line
}

const AlertNotification = ({ title, message, timestamp }: AlertNotificationProps): React.ReactNode => {
  return (
    <div className="bg-gray-600/100 backdrop-blur-sm p-4 rounded-lg border-l-4 border-orange-500 shadow-lg flex items-start space-x-4">
      <div className="text-orange-400 mt-1">
        <AlertTriangleIcon className="h-6 w-6 flex-shrink-0" />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-baseline">
            <h4 className="font-bold text-white">{title}</h4>
            <span className="text-xs text-gray-400">{timestamp}</span>
        </div>
        <p className="text-sm text-gray-300 mt-1">{message}</p>
      </div>
    </div>
  );
};

export default AlertNotification;
