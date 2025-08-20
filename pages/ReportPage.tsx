import React, { useState, useEffect } from 'react';
import { Report } from '../types';
import * as reportService from '../services/reportService'; 
import ViolationCard from '../components/ViolationCard'; 
import { MapIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon } from '../components/Icons';

interface ReportPageProps {
  reportId: string;
  onReportSubmit: () => void;
  navigate?: (path: string) => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ reportId, onReportSubmit, navigate }) => {
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const loadReport = async () => {
            setIsLoading(true);
            const fetchedReport = await reportService.getReportById(reportId);
            if (fetchedReport) {
                setReport(fetchedReport);
                if (fetchedReport.status === 'Reported') {
                    setSubmitted(true);
                }
            } else {
                setError("Could not find the requested report. It may have been deleted.");
            }
            setIsLoading(false);
        };
        loadReport();
    }, [reportId]);

    const handleSubmit = async () => {
        if (report) {
            try {
                await reportService.updateReportStatus(report._id, 'Reported');
                setSubmitted(true);
                // This tells App.tsx to refresh the main reports list
                onReportSubmit(); 
            } catch (err) {
                console.error("Failed to submit report:", err);
                setError("An error occurred while submitting the report. Please try again.");
            }
        }
    }

    if (isLoading) {
        return <div className="text-center text-gray-600 p-8">Loading report...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 p-8">{error}</div>;
    }
    
    if (!report) {
        return <div className="text-center text-gray-600 p-8">Report not found.</div>;
    }

    if (submitted) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 text-center animate-fade-in border border-gray-200">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-3xl font-bold text-gray-800 mt-4">Report Submitted</h2>
                <p className="text-gray-600 mt-2">
                    Thank you! The municipal authorities have been notified about the violations at <span className="font-semibold text-blue-600">{report.location_details}</span>.
                </p>
                <button
                    onClick={() => navigate ? navigate('#/dashboard') : window.location.hash = '#/dashboard'}
                    className="mt-8 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-colors"
                >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Back to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit Violation Report</h1>
            <p className="text-gray-600 mb-6">Review the details below and submit the report to the local municipality.</p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                    <img src={report.imageUrl} alt="Billboard to report" className="rounded-lg shadow-md w-full border border-gray-200" />
                </div>
                <div className="md:col-span-3 bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <div className="flex items-start space-x-3 mb-4">
                        <MapIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-gray-800">Location</h3>
                            <p className="text-gray-600">{report.location_details}</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 mb-4">
                        <ExclamationTriangleIcon className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-gray-800">Summary</h3>
                            <p className="text-gray-600">{report.summary}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Violations</h3>
                        <div className="space-y-2">
                            {report.violations.map((v, i) => (
                                <ViolationCard violation={v} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <p className="text-xs text-gray-500 mb-4">By clicking submit, you confirm that this information is accurate and consent to it being shared with municipal authorities.</p>
                        <button 
                            onClick={handleSubmit}
                            className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-red-500 transition-colors"
                        >
                            Confirm and Submit Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;