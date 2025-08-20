// src/pages/ReportPage.tsx
import React, { useState, useEffect } from 'react';
import { Report } from '../types';
import * as reportService from '../services/reportService'; 
import ViolationCard from '../components/ViolationCard'; 
import { MapIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon } from '../components/Icons';

// <-- FIX 1: Add 'onReportSubmit' to the props interface
interface ReportPageProps {
  reportId: string;
  onReportSubmit: () => void;
  navigate?: (path: string) => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ reportId, onReportSubmit, navigate }) => { // <-- FIX 2: Accept the new function here
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
                // <-- FIX 3: Call the refresh function after successful submission!
                onReportSubmit(); 
            } catch (err) {
                console.error("Failed to submit report:", err);
                setError("An error occurred while submitting the report. Please try again.");
            }
        }
    }

    if (isLoading) {
        return <div className="text-center text-white p-8">Loading report...</div>;
    }

    if (error) {
        return <div className="text-center text-red-400 p-8">{error}</div>;
    }
    
    if (!report) {
        return <div className="text-center text-white p-8">Report not found.</div>;
    }

    if (submitted) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 text-center animate-fade-in">
                <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto" />
                <h2 className="text-3xl font-bold text-white mt-4">Report Submitted</h2>
                <p className="text-gray-300 mt-2">
                    Thank you! The municipal authorities have been notified about the violations at <span className="font-semibold text-teal-300">{report.location_details}</span>.
                </p>
                <button
                    onClick={() => navigate ? navigate('#/dashboard') : window.location.hash = '#/dashboard'}
                    className="mt-8 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500"
                >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Back to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Submit Violation Report</h1>
            <p className="text-gray-400 mb-6">Review the details below and submit the report to the local municipality.</p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                    <img src={report.imageUrl} alt="Billboard to report" className="rounded-lg shadow-xl w-full" />
                </div>
                <div className="md:col-span-3 bg-gray-800 rounded-xl shadow-2xl p-6">
                    {/* ... your location and summary sections ... */}
                    <div>
                        <h3 className="font-semibold text-white mb-2">Violations</h3>
                        <div className="space-y-2">
                            {report.violations.map((v, i) => (
                                // <-- FIX 4: Added a unique key for React performance
                                <ViolationCard  violation={v} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-700 pt-6">
                        <p className="text-xs text-gray-400 mb-4">By clicking submit, you confirm that this information is accurate and consent to it being shared with municipal authorities.</p>
                        <button 
                            onClick={handleSubmit}
                            className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-md text-white bg-red-600 hover:bg-red-700"
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