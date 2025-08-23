// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Report } from './types'; 
import * as authService from './services/authService';
import * as reportService from './services/reportService'; 


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
        setRoute(path); 
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

    
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    
    const fetchReports = async () => {
        setIsLoading(true);
        const fetchedReports = await reportService.fetchMyReports();
        setReports(fetchedReports);
        setIsLoading(false);
    };

    
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
        setReports([]); 
        navigate('#/login');
    };

    const renderPage = () => {
        if (!user) {
            return <LoginPage onLogin={handleLogin} />;
        }

        if (route.startsWith('#/report/')) {
            const reportId = route.split('/')[2];
            
            return <ReportPage 
                        reportId={reportId} 
                        onReportSubmit={fetchReports} 
                        navigate={navigate} 
                    />;
        }

        switch (route.toLowerCase()) {
            case '#/dashboard':
                
                return <DashboardPage 
                            reports={reports} 
                            isLoading={isLoading} 
                            navigate={navigate} 
                        />;
            case '#/inspect':
                
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