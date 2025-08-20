import React, { useState, useEffect, useMemo } from 'react';
import { Report, User } from '../types';
import * as authService from '../services/authService';
import StatCard from '../components/StatCard';
import ReportSummaryCard from '../components/ReportSummaryCard';
import AlertNotification from '../components/AlertNotification';
import { CameraIcon, CheckCircleIcon, ExclamationTriangleIcon, DocumentChartBarIcon, StarIcon, MapPinIcon } from '../components/Icons';
import OSMap from './OSMap';

// This is the correct interface that matches what App.tsx sends
interface DashboardPageProps {
  reports: Report[];
  isLoading: boolean;
  navigate: (path: string) => void;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

// <-- FIX 1: The component now correctly accepts ALL props from App.tsx
const DashboardPage = ({ reports, isLoading, navigate }: DashboardPageProps) => {
  // --- REMOVED ---
  // The component's own 'reports', 'isLoading', 'error', and 'setReports' state
  // has been removed because App.tsx now manages all the data.
  
  // This state is fine because it's specific to the dashboard page itself
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [currentLocation, setCurrentLocation] = useState<Location>({ lat: 20.2961, lng: 85.8245, address: 'Bhubaneswar, Odisha' });
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // --- REMOVED ---
  // The useEffect hook that fetched reports has been removed.
  // App.tsx now does this work.

  // This useEffect for geolocation is perfectly fine and remains.
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await response.json();
              const address = data.display_name || 'Current Location';
              setCurrentLocation({ lat: latitude, lng: longitude, address: address });
            } catch (error) { console.error('Error getting address:', error); }
          },
          (error) => { console.log('Location access denied:', error); },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      }
    };
    getCurrentLocation();
    setMapLoaded(true);
  }, []);
  
  // This calculation now uses the fresh 'reports' prop from App.tsx. It is correct.
  const stats = useMemo(() => {
    let contributionScore = 0;
    const totalAnalyses = reports.length;
    const totalViolations = reports.filter(r => r.violations && r.violations.length > 0).length;
    const totalReported = reports.filter(r => r.status === 'Reported').length;

    reports.forEach(report => {
        contributionScore += 5;
        if (report.violations && report.violations.length > 0) {
            contributionScore += report.violations.length * 10;
        }
    });

    return { totalAnalyses, totalViolations, totalReported, contributionScore };
  }, [reports]);

  const toggleMap = () => setShowMap(!showMap);

  // This now uses the 'isLoading' prop from App.tsx
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading Dashboard...</div>;
  }
  
  
  // --- YOUR ENTIRE ORIGINAL UI IS 100% PRESERVED BELOW ---
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/40 via-transparent to-purple-100/40"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-200/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,1) 1px, transparent 0)`, backgroundSize: '20px 20px' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 animate-fade-in">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="group">
                <h1 className="animate-tracking-in-expand text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-red-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-3 tracking-tight">
                  Welcome back ✨
                </h1>
                <p className="text-gray-600 text-base sm:text-lg font-medium">Your contribution is making our cities safer and smarter.</p>
              </div>
              <div 
                className="flex items-center mt-4 sm:mt-0 backdrop-blur-lg bg-white/20 rounded-2xl px-4 py-3 border border-white/30 shadow-lg cursor-pointer hover:bg-white/30 transition-colors duration-300"
                onClick={toggleMap}
              >
                <div className="relative">
                  <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-3 text-blue-600 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Current Location</p>
                  <p className="text-sm font-bold text-gray-700 truncate max-w-[180px]">
                    {currentLocation.address}
                  </p>
                </div>
              </div>
            </div>
            
            {showMap && (
  <div>

    {/* <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl"> */}
      {/* Close button (top-right) */}
      {/* <button 
        onClick={toggleMap}
        className="absolute top-4 right-4 z-50 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors duration-200"
        aria-label="Close map"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button> */}

      {/* Cancel button (bottom-center) */}
      {/* <button
        onClick={toggleMap}
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white rounded-lg px-6 py-2 shadow-lg hover:bg-red-600 transition-colors duration-200 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancel
      </button> */}


      {/* Map content */}
      {mapLoaded ? (
        <OSMap 
          center={[currentLocation.lat, currentLocation.lng]} 
          zoom={15}
          markerPosition={[currentLocation.lat, currentLocation.lng]}
          onCancel={toggleMap}  // Pass toggle function to OSMap if needed
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          Loading map...
        </div>
      )}

      {/* Location info bar */}
      <div className="absolute bottom-4 left-4 right-4 z-40 bg-white/90 rounded-xl p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-800">
          <span className="font-bold">Your location:</span> {currentLocation.address}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </p>
      </div>
    </div>
)}


            <div className="flex justify-center">
              <button
                onClick={() => navigate('#/inspect')}
                className="group relative inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
                style={{
                  background: 'linear-gradient(135deg, #eb7878 0%, #779dee 33%, #aa71e3 100%)',
                  borderRadius: '25px',
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(235, 120, 120, 0.7) 0%, rgba(119, 157, 238, 0.7) 33%, rgba(170, 113, 227, 0.7) 100%)'
                  }}
                ></div>
                <CameraIcon className="relative h-6 w-6 sm:h-7 sm:w-7 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative">Inspect New</span>
                <div 
                  className="absolute -inset-1 rounded-3xl blur opacity-30 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{
                    background: 'linear-gradient(135deg, #eb7878 0%, #779dee 33%, #aa71e3 100%)'
                  }}
                ></div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <StatCard
                icon={<StarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                label="SCORE"
               value={stats.contributionScore} 
                description="Contribution Score"
                gradientFrom="from-yellow-400"
                gradientTo="to-orange-500"
                colorClass=" bg-gradient-to-br from-yellow-400 to-orange-500"
              />
              <StatCard
                icon={<CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                label="TOTAL"
                value={stats.totalAnalyses}
                description="Total Analyzed"
                gradientFrom="from-green-400"
                gradientTo="to-emerald-500"
                colorClass="bg-gradient-to-br from-green-400 to-emerald-500"
              />
              <StatCard
                icon={<ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                label="FOUND"
                value={stats.totalViolations}
                description="Violations Found"
                gradientFrom="from-orange-400"
                gradientTo="to-red-500"
                colorClass="bg-gradient-to-br from-orange-400 to-red-500"
              />
              <StatCard
                icon={<DocumentChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                label="SENT"
                value={stats.totalReported}
                description="Submitted Reports"
                gradientFrom="from-purple-400"
                gradientTo="to-pink-500"
                colorClass="bg-gradient-to-br from-purple-400 to-pink-500"
              />
            </div>
            
            <div className="animate-slide-up backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl" style={{animationDelay: '400ms'}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Recent Analyses</h2>
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              </div>
              <div className="space-y-4">
                {reports.length > 0 ? (
                  reports.slice(0, 3).map((report, index) => (
                    <div 
                      key={report._id}
                      className="group relative backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      onClick={() => navigate(`#/report/${report._id}`)}
                      style={{ animationDelay: `${600 + index * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <ReportSummaryCard report={report} onClick={() => navigate(`#/report/${report._id}`)} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 sm:py-16 backdrop-blur-lg bg-white/10 border-2 border-dashed border-white/30 rounded-2xl group hover:bg-white/15 transition-all duration-300">
                    <div className="max-w-sm mx-auto px-4">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <CameraIcon className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">No Analyses Yet</h3>
                      <p className="text-gray-600 text-sm sm:text-base font-medium">Click "Inspect New" above to get started! 🚀</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerts Column */}
          <div className="lg:col-span-1 animate-slide-up" style={{animationDelay: '600ms'}}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">🚨 Urgent Alerts</h2>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div className="space-y-4">
                <AlertNotification type="error" title="High Wind Warning" message="Storm warning issued for the next 48 hours. Please report any structurally unsound billboards immediately." timestamp="2h ago" />
                <AlertNotification type="info" title="New Policy Update" message="Content regulations for advertisements near school zones have been updated. Please review." timestamp="1d ago" />
                <AlertNotification type="neutral" title="System Maintenance" message="A brief system maintenance is scheduled for 2:00 AM tonight. Service may be temporarily unavailable." timestamp="3d ago" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
          .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        `
      }} />
    </div>
  );
};

export default DashboardPage;