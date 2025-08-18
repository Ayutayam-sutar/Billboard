import React, { useState, useEffect } from 'react';
import { Report } from '../types';
import * as reportService from '../services/reportService'; 
import * as authService from '../services/authService'; 
import ViolationCard from '../components/ViolationCard'; 
import { MapIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon } from '../components/Icons';

interface ReportPageProps {
  reportId: string;
  navigate?: (path: string) => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ reportId, navigate }) => {
    const [report, setReport] = useState<Report | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const user = authService.getCurrentUser();

    useEffect(() => {
        if (user) {
            const foundReport = reportService.getReportById(user.id, reportId);
            setReport(foundReport);
            if (foundReport?.status === 'Reported') {
                setSubmitted(true);
            }
        } else {
            console.log("User not found, redirecting to login.");
            if (navigate) navigate('#/login');
        }
    }, [reportId, user, navigate]);

    // Inside your ReportPage.tsx

const handleSubmit = async () => {
    if (user && report) {
        try {
            // This now calls the real async function from your service
            await reportService.updateReportStatus(report._id, 'Reported');
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit report:", error);
            // Optionally, set an error state to show the user
        }
    }
}

    if (!report) {
        return <div className="text-center text-white">Loading report...</div>;
    }

    if (submitted) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 text-center animate-fade-in">
                <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto" />
                <h2 className="text-3xl font-bold text-white mt-4">Report Submitted</h2>
                <p className="text-gray-300 mt-2">
                    Thank you for your contribution! The municipal authorities have been notified about the violations at <span className="font-semibold text-teal-300">{report.location_details}</span>.
                </p>
                <button
                    onClick={() => navigate ? navigate('#/inspect') : alert('Navigate to inspector!')}
                    className="mt-8 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500"
                >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Back to Inspector
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
                    <div className="flex items-start space-x-3 mb-4">
                        <MapIcon className="h-6 w-6 text-teal-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-white">Location</h3>
                            <p className="text-gray-300">{report.location_details}</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 mb-4">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-white">Summary</h3>
                            <p className="text-gray-300">{report.summary}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-2">Violations</h3>
                        <div className="space-y-2">
                            {report.violations.map((v, i) => (
                                <ViolationCard key={`violation-${i}`} violation={v} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-700 pt-6">
                        <p className="text-xs text-gray-400 mb-4">By clicking submit, you confirm that this information is accurate to the best of your knowledge and consent to it being shared with municipal authorities.</p>
                        <button 
                            onClick={handleSubmit}
                            className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-transform transform hover:scale-105"
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