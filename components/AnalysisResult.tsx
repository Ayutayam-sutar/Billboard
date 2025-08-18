import React from 'react';
import { Report } from '../types';
// We no longer need ViolationCard for this simple display
// import ViolationCard from './ViolationCard'; 
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon, DocumentChartBarIcon, MapIcon } from './Icons';

interface AnalysisResultProps {
  report: Report;
  onReset: () => void;
  navigate?: (path: string) => void;
}

const AnalysisResult = ({ report, onReset, navigate }: AnalysisResultProps): React.ReactNode => {
  // --- THIS IS THE FIX ---
  // --- 🕵️‍♂️ FINAL INSPECTOR LOG ---
  // This will print the data directly in your BROWSER's console (F12)
  console.log("--- 🕵️‍♂️ Data received by AnalysisResult component ---");
  console.log(report);
  // --- END OF INSPECTOR ---

  // We check if the violations array exists and is not empty.
  const isCompliant = !report.violations || report.violations.length === 0;
  // We determine compliance based on whether the violations array is empty.

  return (
    <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-black">Analysis Complete</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <img 
            src={report.imageUrl} 
            alt="Analyzed billboard" 
            className="w-full h-auto object-contain rounded-lg shadow-lg mb-4" 
          />
          <div className="bg-gray-900/100 rounded-lg p-3 text-sm shadow-lg">
            <div className="flex items-start space-x-3">
              <MapIcon className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-200">Location Details</h4>
                {/* We use a placeholder as this detail isn't in the YOLOv8 response yet */}
                <p className="text-white">Analysis based on the uploaded image.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <div className={`rounded-lg p-4 flex items-center space-x-4 shadow-lg ${isCompliant ? 'bg-green-600/100' : 'bg-red-600/100'}`}>
            {isCompliant ? (
              <CheckCircleIcon className="h-10 w-10 text-green-400 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="h-10 w-10 text-red-400 flex-shrink-0" />
            )}
            <div>
              <h3 className={`text-xl font-bold ${isCompliant ? 'text-green-300' : 'text-red-300'}`}>
                {isCompliant ? 'Compliant' : 'Violations Found'}
              </h3>
              {/* We use a summary based on the result */}
              <p className="text-white">{isCompliant ? 'No violations were detected.' : 'One or more potential violations were found.'}</p>
            </div>
          </div>

          {/* --- THIS IS THE FIX --- */}
          {/* We now correctly check and display the violations */}
          {!isCompliant && (
            <div className="space-y-3 max-h-80 bg-gray-100 rounded-lg p-4 overflow-y-auto pr-2">
              <h4 className="text-lg font-semibold text-black">Detected Violations:</h4>
              {/* We map over the array of strings and display each one */}
              {report.violations.map((violationText, index) => (
                <div key={index} className="bg-white p-3 rounded-md shadow">
                    <p className="text-gray-800">{violationText}</p>
                </div>
              ))}
            </div>
          )}

          {isCompliant && (
            <div className="text-center text-gray-700 p-4 bg-gray-100 rounded-lg">
              No violations were detected based on the analysis.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Analyze Another
        </button>
        
        {!isCompliant && (
          <button
            onClick={() => navigate ? navigate(`#/report/${report._id}`) : alert('Navigation failed!')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
          >
            <DocumentChartBarIcon className="h-5 w-5 mr-2" />
            Report to Municipality
          </button>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;