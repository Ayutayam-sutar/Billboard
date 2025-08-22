// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Report } from './types'; // Import the 'Report' type
import * as authService from './services/authService';
import * as reportService from './services/reportService'; 

// Import Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import InspectPage from './pages/InspectPage';
import ReportPage from './pages/ReportPage';
import Layout from './components/Layout';
import HeatmapArea from './pages/HeatmapArea';

const App = (): React.ReactNode => {
    const [user, setUser] = useState<User | null>(authService.getCurrentUser());
    const [route, setRoute] = useState<string>(window.location.hash || (user ? '#/dashboard' : '#/login'));

    const navigate = useCallback((path: string) => {
        window.location.hash = path;
        setRoute(path); // Also update route state immediately
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // --- Master list of reports now lives here ---
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Function to fetch/refresh the reports ---
    const fetchReports = async () => {
        setIsLoading(true);
        const fetchedReports = await reportService.fetchMyReports();
        setReports(fetchedReports);
        setIsLoading(false);
    };

    // --- Fetch reports when the user logs in ---
    useEffect(() => {
        if (user) {
            fetchReports();
        }
    }, [user]);
    
    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        navigate('#/dashboard');
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setReports([]); // Clear reports on logout
        navigate('#/login');
    };

    const renderPage = () => {
        if (!user) {
            return <LoginPage onLogin={handleLogin} />;
        }

        if (route.startsWith('#/report/')) {
            const reportId = route.split('/')[2];
            //  Pass the 'fetchReports' function down so the page can trigger a refresh ---
            return <ReportPage 
                        reportId={reportId} 
                        onReportSubmit={fetchReports} 
                        navigate={navigate} 
                    />;
        }

        switch (route.toLowerCase()) {
            case '#/dashboard':
                // Pass the master 'reports' list and loading state down to the Dashboard ---
                return <DashboardPage 
                            reports={reports} 
                            isLoading={isLoading} 
                            navigate={navigate} 
                        />;
            case '#/inspect':
                // Pass fetchReports to InspectPage so it can refresh after a new analysis
                return <InspectPage 
                            user={user} 
                            onAnalysisComplete={fetchReports} 
                            navigate={navigate} 
                        />;
            case '#/profile':
                return <ProfilePage user={user} onLogout={handleLogout} />;
            case '#/map':
                return <HeatmapArea user={user} onClose={() => navigate('#/dashboard')} />;
            default:
                navigate('#/dashboard');
                return <DashboardPage reports={reports} isLoading={isLoading} navigate={navigate} />;
        }
    };
    
    return (
        user ? (
            <Layout user={user} navigate={navigate} onLogout={handleLogout}>
                {renderPage()}
            </Layout>
        ) : (
            <LoginPage onLogin={handleLogin} />
        )
    );
};

export default App;