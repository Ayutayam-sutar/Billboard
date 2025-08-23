import React, { useMemo, useState, useEffect } from 'react';
import { User, Report } from '../types';
import * as reportService from '../services/reportService';
import StatCard from '../components/StatCard';
import { CheckCircleIcon, ExclamationTriangleIcon, DocumentChartBarIcon, StarIcon, LogOutIcon } from '../components/Icons';

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
}

const ProfilePage = ({ user, onLogout }: ProfilePageProps): React.ReactNode => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

    useEffect(() => {
        const fetchMyReports = async () => {
          try {
            setIsLoading(true);
          const reports = await reportService.fetchMyReports();
            setReports(reports);
            setError(null);
          } catch (err) {
            console.error("Failed to fetch reports for profile:", err);
            setError("Could not load your activity.");
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchMyReports();
    }, []);

   const stats = useMemo(() => {
    const totalAnalyses = reports.length;
    const totalViolations = reports.filter(r => r.violations && r.violations.length > 0).length;
    const totalReported = reports.filter(r => r.status === 'Reported').length;

    let contributionScore = 0;
    reports.forEach(report => {
        contributionScore += 5;
        if (report.violations && report.violations.length > 0) {
            contributionScore += report.violations.length * 10; 
        }
    });

    return { totalAnalyses, totalViolations, totalReported, contributionScore };
}, [reports]);
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading Profile...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold text-xl">{error}</div>;
    }

    return (
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 animate-fade-in">
            {/* Profile Header */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                    </span>
                </div>
               
                <div className="flex-grow">
                    <h1 className="animate-tracking-in-expand text-xl sm:text-2xl md:text-3xl font-bold text-white">{user.name}</h1>
                    <p className="text-teal-300 text-sm sm:text-base">{user.email}</p>
                  <div 
    className="relative mt-1 sm:mt-2 inline-flex items-center gap-1 sm:gap-2 bg-yellow-500/10 text-yellow-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-yellow-500/20 transition-colors"
    onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
>
    <StarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
    <span className="font-bold sm:text-lg">{stats.contributionScore}</span>
    <span className="hidden sm:inline">Contribution Points</span>
    <span className="sm:hidden">Points</span>
   {showScoreBreakdown && (
    
   <div className="absolute left-full mb-2 w-64 
                bg-gray-900/80 backdrop-blur-md border border-gray-700 
                rounded-lg shadow-xl p-4 text-left z-10">
  <h4 className="font-bold text-white mb-2">Score Breakdown</h4>
  <ul className="text-sm text-gray-300 space-y-1">
    <li className="flex justify-between">
      <span>Reports Submitted:</span>
      <span className="font-mono">{stats.totalAnalyses} x 5 pts</span>
    </li>
    <li className="flex justify-between">
      <span>Violations Found:</span>
      <span className="font-mono">
        {reports.reduce((acc, r) => acc + (r.violations?.length || 0), 0)} x 10 pts
      </span>
    </li>
    <li className="border-t border-gray-700 mt-2 pt-2 flex justify-between font-bold text-white">
      <span>Total Score:</span>
      <span className="font-mono">{stats.contributionScore}</span>
    </li>
  </ul>
</div>

)}
</div>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex-shrink-0 text-gray-300 hover:bg-red-800/50 hover:text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2"
                >
                    <LogOutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Logout</span>
                </button>
            </div>
            
            {/* Stats Section */}
            <div className="mt-6 sm:mt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">Your Contribution Stats</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <StatCard 
                        icon={<CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-teal-300" />}
                        value={stats.totalAnalyses}
                        label="Total Analyzed"
                        colorClass="bg-teal-500/20" 
                        gradientFrom={''} 
                        gradientTo={''}
                    />
                    <StatCard 
                        icon={<ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-300" />}
                        value={stats.totalViolations}
                        label="Violations Found"
                        colorClass="bg-orange-500/20" 
                        gradientFrom={''} 
                        gradientTo={''}
                    />
                    <StatCard 
                        icon={<DocumentChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-300" />}
                        value={stats.totalReported}
                        label="Reports Submitted"
                        colorClass="bg-red-500/20" 
                        gradientFrom={''} 
                        gradientTo={''}
                    />
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="mt-6 sm:mt-8">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">Recent Activity</h2>
                <div className="space-y-2 sm:space-y-3">
                    {reports.length > 0 ? (
                        reports.slice(0, 4).map(report => (
                       <div key={report._id} className="bg-gray-800/50 p-3 sm:p-4 rounded-lg flex justify-between items-center transition-all hover:bg-gray-700/50">
    <div className="flex items-center gap-4">
        {/* FIX 1: Use an <img> tag to display the image */}
        <img 
            src={report.imageUrl} 
            alt="Report thumbnail" 
            className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-md shadow-lg"
        />
        <div>
            <p className={`text-sm sm:text-base font-semibold ${report.violations.length === 0 ? 'text-green-300' : 'text-red-300'}`}>
                {report.violations.length === 0 ? 'Compliant' : 'Violations Found'}
            </p>
            {/* FIX 2: Show the first violation or the summary */}
            <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 max-w-xs">
    {report.violations.length > 0 ? report.violations[0].details : report.summary}
</p>
        </div>
    </div>
  
</div>
                        ))
                    ) : (
                        <p className="text-black text-center py-4">No activity yet. Start by inspecting a billboard!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;