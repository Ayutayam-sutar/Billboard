import React from 'react';
import { MapPin, Eye, Wrench, Maximize2, Shield, HelpCircle, AlertTriangle } from 'lucide-react';
import { Violation, ViolationType, Severity } from '../types';

interface ViolationCardProps {
  violation: Violation;
}

const ViolationCard = ({ violation }: ViolationCardProps): React.ReactNode => {

    const getIcon = () => {
        switch (violation.violation_type) {
            case ViolationType.Placement: return <MapPin className="h-5 w-5 flex-shrink-0" />;
            case ViolationType.Content: return <Eye className="h-5 w-5 flex-shrink-0" />;
            case ViolationType.Structural: return <Wrench className="h-5 w-5 flex-shrink-0" />;
            case ViolationType.Size: return <Maximize2 className="h-5 w-5 flex-shrink-0" />;
            case ViolationType.Authorization: return <Shield className="h-5 w-5 flex-shrink-0" />;
            default: return <HelpCircle className="h-5 w-5 flex-shrink-0" />;
        }
    };

    // --- THIS IS THE FIX ---
    // This function now returns complete strings, which Tailwind can detect.
    const getSeverityStyles = () => {
        switch(violation.severity) {
            case Severity.High: 
                return 'border-red-500 bg-red-600/100 text-white';
            case Severity.Medium: 
                return 'border-orange-500 bg-orange-600/100 text-white';
            case Severity.Low: 
                return 'border-yellow-500 bg-yellow-600/100 text-white';
            default: 
                return 'border-gray-600 bg-gray-700/100 text-white';
        }
    };
    
    const styles = getSeverityStyles();
    
    return (
        <div 
            className={`p-3 rounded-lg border-l-4 ${styles} transition-all duration-300 shadow-lg`}
        >
            <div className="flex items-start space-x-3">
                <div className="mt-1"> {/* Text color is inherited from the parent div now */}
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <h5 className="font-bold text-gray-200">
                            {violation.violation_type}
                        </h5>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ring-white/20`}>
                            {violation.severity}
                        </span>
                        {violation.severity === Severity.High && (
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                        )}
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{violation.details}</p>
                </div>
            </div>
        </div>
    );
};

export default ViolationCard;